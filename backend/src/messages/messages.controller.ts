import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

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
  async getSupportContact() {
    // For drivers to quickly get the operator/support account to chat with
    // For now we just find any user with role OPERATOR or SUPER_ADMIN
    return await this.messagesService.getSupportContact();
  }
}
