import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { FacilityStage } from './entities/facility-stage.entity';
import { OrderAction } from './entities/order-action.entity';
import { Service, MeasurementUnit } from '../services/entities/service.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(FacilityStage)
    private facilityStageRepository: Repository<FacilityStage>,
    @InjectRepository(OrderAction)
    private orderActionRepository: Repository<OrderAction>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private calculateItemPrice(
    item: { width?: number; length?: number; quantity: number },
    service: Service,
  ): number {
    const price = Number(service.price);

    switch (service.measurementUnit) {
      case MeasurementUnit.SQM:
        const width = Number(item.width) || 0;
        const length = Number(item.length) || 0;
        const area = width * length;
        return Math.round(area * price * 100) / 100;

      default:
        return Math.round(Number(item.quantity) * price * 100) / 100;
    }
  }

  async create(createOrderDto: CreateOrderDto) {
    const { items, ...orderData } = createOrderDto;

    // Run within transaction for ACID compliance
    return this.orderRepository.manager.transaction(
      async (manager: EntityManager) => {
        // 0. Pre-fetch services to infer companyId if missing and calculate prices later
        let services: Service[] = [];
        let serviceMap = new Map<string, Service>();
        if (items && items.length > 0) {
          const serviceIds = items.map((i) => i.serviceId);
          services = await manager.find(Service, {
            where: { id: In(serviceIds) },
          });
          serviceMap = new Map(services.map((s) => [s.id, s]));
          
          if (!orderData.companyId && services.length > 0) {
            orderData.companyId = services[0].companyId;
          }
        }

        // 1. Create Order shell
        const order = manager.create(Order, {
          ...orderData,
          status: OrderStatus.NEW,
          totalAmount: 0,
        });
        const savedOrder = await manager.save(order);

        let totalAmount = 0;

        if (items && items.length > 0) {
          const orderItems: OrderItem[] = [];

          for (const itemDto of items) {
            const service = serviceMap.get(itemDto.serviceId);
            if (!service) {
              throw new NotFoundException(
                `Xizmat #${itemDto.serviceId} topilmadi`,
              );
            }

            const totalPrice = this.calculateItemPrice(itemDto, service);
            totalAmount += totalPrice;

            const orderItem = manager.create(OrderItem, {
              orderId: savedOrder.id,
              serviceId: itemDto.serviceId,
              barcode: itemDto.barcode,
              width: itemDto.width,
              length: itemDto.length,
              quantity: itemDto.quantity,
              totalPrice,
            });

            orderItems.push(orderItem);
          }

          await manager.save(orderItems);
        }

        // 3. Finalize Order total
        savedOrder.totalAmount = totalAmount;
        const finalOrder = await manager.save(savedOrder);

        // Side Effect: Notification (Post-transaction or safe async)
        this.notificationsService
          .create({
            companyId: finalOrder.companyId,
            title: 'Yangi buyurtma',
            text: `Yangi buyurtma qabul qilindi. ID: ${finalOrder.id.substring(0, 8)}`,
            type: 'order',
          })
          .catch((err) => console.error('Notification failed:', err));

        return finalOrder;
      },
    );
  }

  async findAll() {
    return this.orderRepository.find({
      relations: [
        'customer',
        'driver',
        'operator',
        'items',
        'items.service',
        'company',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.orderRepository.find({
      where: { companyId },
      relations: ['customer', 'driver', 'operator', 'items', 'items.service'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'driver',
        'operator',
        'items',
        'items.service',
        'company',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Buyurtma #${id} topilmadi`);
    }
    return order;
  }

  async updateStatus(id: string, updateDto: any, userId?: string) {
    const order = await this.findOne(id);

    if (updateDto.status) {
      order.status = updateDto.status;
    }
    if (updateDto.facilityStageId !== undefined) {
      order.facilityStageId = updateDto.facilityStageId || null;
    }
    if (updateDto.driverId) {
      order.driverId = updateDto.driverId;
      // Haydovchi tayinlanganda status avtomatik o'zgaradi
      if (order.status === OrderStatus.NEW) {
        order.status = OrderStatus.DRIVER_ASSIGNED;
        await this.notificationsService.create({
          companyId: order.companyId,
          title: 'Haydovchi tayinlandi',
          text: `Buyurtmaga haydovchi biriktirildi.`,
          type: 'order',
        });
      }

      // 📱 DISPATCH PUSH NOTIFICATION TO DRIVER'S MOBILE
      try {
        const driver = await this.orderRepository.manager.findOne(User, { where: { id: updateDto.driverId } });
        if (driver && driver.expoPushToken) {
           this.notificationsService.sendPushNotification(
              driver.expoPushToken, 
              'Yangi buyurtma qabul qilindi! 🎉', 
              `Sizga ajoyib bir yangi manzil biriktirildi. Diqqat bilan ko'zdan kechiring!`, 
              { orderId: order.id }
           );
        }
      } catch (err) {
         console.warn('Driver Push fail:', err);
      }
    }
    if (updateDto.paymentStatus) {
      order.paymentStatus = updateDto.paymentStatus;
    }
    if (updateDto.notes) {
      order.notes = updateDto.notes;
    }
    if (updateDto.deadlineDate) {
      order.deadlineDate = new Date(updateDto.deadlineDate);
    }

    const saved = await this.orderRepository.save(order);

    if (updateDto.status) {
      await this.notificationsService.create({
        companyId: order.companyId,
        title: "Buyurtma holati o'zgardi",
        text: `Holati: ${updateDto.status}`,
        type: 'order',
      });

      // Haydovchiga yetkazish vaqti kelganda eslatma
      if (updateDto.status === OrderStatus.READY_FOR_DELIVERY && order.driverId) {
        try {
          const driver = await this.orderRepository.manager.findOne(User, { where: { id: order.driverId } });
          if (driver && driver.expoPushToken) {
            this.notificationsService.sendPushNotification(
              driver.expoPushToken, 
              'Gilam yetkazishga tayyor! 🚐', 
              `Buyurtma (${order.id.substring(0, 8)}) qadoqlandi va tayyor. Yo'lga chiqishingiz mumkin!`, 
              { orderId: order.id, status: updateDto.status }
            );
          }
        } catch (err) {
          console.warn('Ready for delivery driver push fail:', err);
        }
      }
    }

    if (updateDto.status && userId) {
      const action = this.orderActionRepository.create({
        orderId: id,
        userId: userId,
        action: updateDto.status,
      });
      await this.orderActionRepository.save(action);
    }

    return saved;
  }

  async getWorkerCompletedOrders(companyId: string, userId: string) {
    const actions = await this.orderActionRepository.find({
      where: { userId },
      select: ['orderId'],
    });

    const orderIds = [...new Set(actions.map(a => a.orderId))];
    if (orderIds.length === 0) return [];

    return this.orderRepository.find({
      where: { id: In(orderIds), companyId },
      relations: ['customer', 'items', 'items.service', 'facilityStage'],
      order: { updatedAt: 'DESC' },
      take: 50,
    });
  }

  async getFacilityStages(companyId: string) {
    return this.facilityStageRepository.find({
      where: { companyId },
      order: { orderIndex: 'ASC', createdAt: 'ASC' }
    });
  }

  async createFacilityStage(companyId: string, name: string, icon: string) {
    const existing = await this.facilityStageRepository.find({ where: { companyId }});
    const nextIndex = existing.length > 0 ? Math.max(...existing.map(s => s.orderIndex)) + 1 : 0;
    const stage = this.facilityStageRepository.create({
      companyId,
      name,
      icon: icon || 'folder',
      orderIndex: nextIndex,
    });
    return this.facilityStageRepository.save(stage);
  }

  async getDriverActiveOrders(driverId: string) {
    return this.orderRepository.find({
      where: [
        { driverId, status: OrderStatus.DRIVER_ASSIGNED },
        { driverId, status: OrderStatus.PICKED_UP },
        // Haydovchi gibrid ko'rishi mumkin lekin asosan yetkazishlari
        { driverId, status: OrderStatus.READY_FOR_DELIVERY },
        { driverId, status: OrderStatus.OUT_FOR_DELIVERY },
      ],
      relations: ['customer', 'items', 'items.service'],
      order: { createdAt: 'DESC' },
    });
  }

  async getFacilityOrders(companyId: string) {
    return this.orderRepository.find({
      where: [
        { companyId, status: OrderStatus.AT_FACILITY },
        { companyId, status: OrderStatus.WASHING },
        { companyId, status: OrderStatus.DRYING },
        { companyId, status: OrderStatus.FINISHED },
        { companyId, status: OrderStatus.PICKED_UP }, // Ba'zan sexga yetib kelganini belgilash uchun
      ],
      relations: ['customer', 'items', 'items.service'],
      order: { createdAt: 'DESC' },
    });
  }

  async getDriverCompletedOrders(driverId: string) {
    return this.orderRepository.find({
      where: [
        { driverId, status: OrderStatus.AT_FACILITY },
        { driverId, status: OrderStatus.WASHING },
        { driverId, status: OrderStatus.DRYING },
        { driverId, status: OrderStatus.FINISHED },
        { driverId, status: OrderStatus.DELIVERED },
        { driverId, status: OrderStatus.CANCELLED },
      ],
      relations: ['customer', 'items', 'items.service'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getFacilityCompletedOrders(companyId: string) {
    return this.orderRepository.find({
      where: [
        { companyId, status: OrderStatus.READY_FOR_DELIVERY },
        { companyId, status: OrderStatus.OUT_FOR_DELIVERY },
        { companyId, status: OrderStatus.DELIVERED },
        { companyId, status: OrderStatus.CANCELLED },
      ],
      relations: ['customer', 'items', 'items.service'],
      order: { updatedAt: 'DESC' },
      take: 50,
    });
  }

  async getCompanyStats(companyId: string) {
    const orders = await this.orderRepository.find({
      where: { companyId },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );
    const newOrders = orders.filter((o) => o.status === OrderStatus.NEW).length;
    const inProgress = orders.filter((o) =>
      [
        OrderStatus.DRIVER_ASSIGNED,
        OrderStatus.PICKED_UP,
        OrderStatus.AT_FACILITY,
        OrderStatus.WASHING,
        OrderStatus.DRYING,
      ].includes(o.status),
    ).length;
    const completed = orders.filter(
      (o) => o.status === OrderStatus.DELIVERED,
    ).length;

    return { totalOrders, totalRevenue, newOrders, inProgress, completed };
  }

  async updateItemPrice(itemId: string, price: number) {
    const item = await this.orderItemRepository.findOne({
      where: { id: itemId },
    });
    if (!item) {
      throw new NotFoundException(`Item #${itemId} topilmadi`);
    }

    item.totalPrice = price;
    await this.orderItemRepository.save(item);

    // Update order totalAmount
    const order = await this.orderRepository.findOne({
      where: { id: item.orderId },
      relations: ['items'],
    });

    if (order) {
      order.totalAmount = order.items.reduce(
        (acc, i) => acc + Number(i.totalPrice || 0),
        0,
      );
      await this.orderRepository.save(order);
    }

    return order;
  }
}
