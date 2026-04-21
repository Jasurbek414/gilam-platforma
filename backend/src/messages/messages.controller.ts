import { Controller, Get, Post, Body, Param, UseGuards, Request, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from '../notifications/notifications.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Get('conversations')
  async getConversations(@Request() req) {
    const userId = req.user.id;
    return await this.messagesService.getConversations(userId);
  }

  @Get('history/:otherUserId')
  async getHistory(@Request() req, @Param('otherUserId') otherUserId: string) {
    const userId = req.user.id;
    return await this.messagesService.findAllByConversation(
      userId,
      otherUserId,
    );
  }

  @Get('support-contact')
  async getSupportContact(@Req() req: any) {
    return await this.messagesService.getSupportContact(req.user?.companyId);
  }

  // HTTP fallback — socket offline bo'lsa Flutter shu endpoint orqali xabar yuboradi
  @Post()
  async createMessage(@Request() req, @Body() body: any) {
    const senderId = req.user.id;
    const { recipientId, text, companyId } = body;

    const message = await this.messagesService.create({
      senderId,
      recipientId,
      text,
      companyId,
    });

    // Push notification recipient'ga
    try {
      const recipient = await this.userRepo.findOne({ where: { id: recipientId } });
      if (recipient?.expoPushToken) {
        const sender = await this.userRepo.findOne({ where: { id: senderId } });
        const senderName = sender?.fullName || 'Xabar';
        let pushBody = text || '';
        if (text?.startsWith('[IMAGE]:')) pushBody = '📷 Rasm yubordi';
        else if (text?.startsWith('[LOCATION]:')) pushBody = '📍 Lokatsiya yubordi';
        else if (pushBody.length > 80) pushBody = pushBody.substring(0, 80) + '…';

        await this.notificationsService.sendPushNotification(
          recipient.expoPushToken,
          `💬 ${senderName}`,
          pushBody,
          { type: 'chat', senderId, companyId, channelId: 'gilam_chat' },
        );
      }
    } catch (_) {}

    return message;
  }
}
