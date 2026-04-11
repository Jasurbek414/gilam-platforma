import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = this.notificationRepo.create(dto);
    return this.notificationRepo.save(notification);
  }

  // SuperAdmin uchun barcha umumiy (ya'ni barchaga tegishli yoki o'ziga taalluqli) bildirishnomalar
  async getForSuperAdmin() {
    return this.notificationRepo.find({
      where: { companyId: IsNull(), userId: IsNull() }, // Mantiqan shunday bo'lishi mumkin
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  // Ma'lum bir company uchun
  async getByCompany(companyId: string) {
    return this.notificationRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  // Ma'lum bir user uchun (yoki o'sha user tegishli bo'lgan korxona bildirishnomalari)
  async getByUser(userId: string, companyId?: string) {
    return this.notificationRepo.find({
      where: [
        { userId },
        { companyId, userId: IsNull() }, // company level unassigned users
      ],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    await this.notificationRepo.update(id, { isRead: true });
    return { success: true };
  }

  async markAllAsReadForCompany(companyId: string) {
    await this.notificationRepo.update({ companyId }, { isRead: true });
    return { success: true };
  }

  async markAllAsReadForSuperAdmin() {
    await this.notificationRepo.update(
      { companyId: IsNull() },
      { isRead: true },
    );
    return { success: true };
  }
}
