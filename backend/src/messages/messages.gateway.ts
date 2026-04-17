import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.query.token as string;
      if (!token) {
        socket.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      this.connectedUsers.set(userId, socket.id);
      socket.join(`user-${userId}`);

      console.log(`User connected to chat: ${userId}`);
    } catch (e) {
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === socket.id) {
        this.connectedUsers.delete(userId);
        console.log(`User disconnected from chat: ${userId}`);
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: { recipientId: string; text: string; companyId: string },
  ) {
    const senderSocketId = socket.id;
    let senderId: string | null = null;

    for (const [uId, sId] of this.connectedUsers.entries()) {
      if (sId === senderSocketId) {
        senderId = uId;
        break;
      }
    }

    if (!senderId) return;

    try {
      // Save to DB — canonical source of truth
      const message = await this.messagesService.create({
        text: data.text,
        senderId,
        recipientId: data.recipientId,
        companyId: data.companyId,
      });

      // Sender ma'lumotini olib qo'shamiz (UI uchun)
      const senderUser = await this.userRepository.findOne({ where: { id: senderId } });
      const enriched = { ...message, sender: senderUser };

      // 1. Deliver to recipient's room (operator or driver on another device)
      this.server.to(`user-${data.recipientId}`).emit('newMessage', enriched);

      // 2. Echo DB-persisted message back to sender's room.
      this.server.to(`user-${senderId}`).emit('messageSent', enriched);

      // 3. If recipient is offline → send Expo push notification
      const isRecipientOnline = this.connectedUsers.has(data.recipientId);
      if (!isRecipientOnline) {
        try {
          const recipient = await this.userRepository.findOne({
            where: { id: data.recipientId },
          });
          if (recipient?.expoPushToken) {
            const senderUser = await this.userRepository.findOne({
              where: { id: senderId },
            });
            const senderName = senderUser?.fullName || 'Xabar';

            // channelId: 'chat_messages' — Android da HIGH importance kanal
            // Bu "heads-up" (ekran tepasidan tushuvchi) bildirishnomani ta'minlaydi
            await this.notificationsService.sendPushNotification(
              recipient.expoPushToken,
              `💬 ${senderName}`,
              data.text,
              {
                type: 'chat',
                senderId,
                companyId: data.companyId,
                channelId: 'chat_messages',
              },
            );
          }
        } catch (pushErr) {
          // Push failure must not break message delivery
          console.warn('[Chat] Push notification error:', pushErr);
        }
      }

      return message;
    } catch (e) {
      console.error('SendMessage DB Error:', e);
      return { error: 'Failed to save message' };
    }
  }
}
