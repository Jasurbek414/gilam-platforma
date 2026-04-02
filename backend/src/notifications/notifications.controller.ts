import { Controller, Get, Post, Body, Param, Patch, ParseUUIDPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  // Barchasini o'qish (faqat Super Admin uchun mo'ljallangan global xabarlar)
  @Get('superadmin')
  getForSuperAdmin() {
    return this.notificationsService.getForSuperAdmin();
  }

  @Get('company/:companyId')
  getByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.notificationsService.getByCompany(companyId);
  }

  @Get('user/:userId')
  getByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    // Agar companyId ham filter qilinishi kerak bo'lsa query dan olamiz, ammo oddiylik uchun userId o'zi.
    return this.notificationsService.getByUser(userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('company/:companyId/read-all')
  markAllAsReadCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.notificationsService.markAllAsReadForCompany(companyId);
  }

  @Patch('superadmin/read-all')
  markAllAsReadSuperAdmin() {
    return this.notificationsService.markAllAsReadForSuperAdmin();
  }
}
