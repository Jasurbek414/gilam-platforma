import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Service, MeasurementUnit } from '../services/entities/service.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  /**
   * NARX HISOBLASH ALGORITMI:
   * 1. Har bir OrderItem uchun tegishli Service dan narxni olish
   * 2. O'lchov birligi bo'yicha totalPrice hisoblash:
   *    - SQM (kv.metr): width × length × price
   *    - KG / PIECE / SET / FIXED: quantity × price
   *    - METER / CM: quantity × price
   * 3. Order.totalAmount = barcha itemlar yig'indisi
   */
  private calculateItemPrice(
    item: { width?: number; length?: number; quantity: number },
    service: Service,
  ): number {
    const price = Number(service.price);

    switch (service.measurementUnit) {
      case MeasurementUnit.SQM:
        // Gilam: eni × bo'yi × narx
        const width = item.width || 0;
        const length = item.length || 0;
        const area = width * length;
        return Math.round(area * price * 100) / 100;

      case MeasurementUnit.KG:
      case MeasurementUnit.PIECE:
      case MeasurementUnit.SET:
      case MeasurementUnit.FIXED:
      case MeasurementUnit.METER:
      case MeasurementUnit.CM:
      case MeasurementUnit.HOUR:
        // Miqdor × narx
        return Math.round(item.quantity * price * 100) / 100;

      default:
        return Math.round(item.quantity * price * 100) / 100;
    }
  }

  async create(createOrderDto: CreateOrderDto) {
    const { items, ...orderData } = createOrderDto;

    // 1. Order yaratish
    const order = this.orderRepository.create({
      ...orderData,
      status: OrderStatus.NEW,
      totalAmount: 0,
    });
    const savedOrder = await this.orderRepository.save(order);

    // 2. Har bir item uchun narx hisoblash va saqlash
    let totalAmount = 0;

    if (items && items.length > 0) {
      const orderItems: OrderItem[] = [];

      for (const itemDto of items) {
        // Xizmat turini bazadan olish
        const service = await this.serviceRepository.findOne({
          where: { id: itemDto.serviceId },
        });

        if (!service) {
          throw new NotFoundException(`Xizmat #${itemDto.serviceId} topilmadi`);
        }

        // Narx hisoblash
        const totalPrice = this.calculateItemPrice(itemDto, service);
        totalAmount += totalPrice;

        const orderItem = this.orderItemRepository.create({
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

      await this.orderItemRepository.save(orderItems);
    }

    // 3. Order totalAmount yangilash
    savedOrder.totalAmount = totalAmount;
    await this.orderRepository.save(savedOrder);

    return this.findOne(savedOrder.id);
  }

  async findAll() {
    return this.orderRepository.find({
      relations: ['customer', 'driver', 'operator', 'items', 'items.service', 'company'],
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
      relations: ['customer', 'driver', 'operator', 'items', 'items.service', 'company'],
    });

    if (!order) {
      throw new NotFoundException(`Buyurtma #${id} topilmadi`);
    }
    return order;
  }

  async updateStatus(id: string, updateDto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);

    if (updateDto.status) {
      order.status = updateDto.status;
    }
    if (updateDto.driverId) {
      order.driverId = updateDto.driverId;
      // Haydovchi tayinlanganda status avtomatik o'zgaradi
      if (order.status === OrderStatus.NEW) {
        order.status = OrderStatus.DRIVER_ASSIGNED;
      }
    }
    if (updateDto.paymentStatus) {
      order.paymentStatus = updateDto.paymentStatus;
    }
    if (updateDto.notes) {
      order.notes = updateDto.notes;
    }

    return this.orderRepository.save(order);
  }

  async getDriverActiveOrders(driverId: string) {
    return this.orderRepository.find({
      where: [
        { driverId, status: OrderStatus.DRIVER_ASSIGNED },
        { driverId, status: OrderStatus.PICKED_UP },
        { driverId, status: OrderStatus.OUT_FOR_DELIVERY },
      ],
      relations: ['customer', 'items'],
    });
  }

  async getCompanyStats(companyId: string) {
    const orders = await this.orderRepository.find({
      where: { companyId },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const newOrders = orders.filter(o => o.status === OrderStatus.NEW).length;
    const inProgress = orders.filter(o =>
      [OrderStatus.DRIVER_ASSIGNED, OrderStatus.PICKED_UP, OrderStatus.AT_FACILITY,
       OrderStatus.WASHING, OrderStatus.DRYING].includes(o.status)
    ).length;
    const completed = orders.filter(o => o.status === OrderStatus.DELIVERED).length;

    return { totalOrders, totalRevenue, newOrders, inProgress, completed };
  }
}
