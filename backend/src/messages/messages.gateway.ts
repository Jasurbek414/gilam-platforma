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
      socket.join(`user-${userId}`); // Join private room

      console.log(`User connected to chat: ${userId}`);
    } catch (e) {
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    // Find and remove userId entry
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
      // Save to DB
      const message = await this.messagesService.create({
        text: data.text,
        senderId,
        recipientId: data.recipientId,
        companyId: data.companyId,
      });

      // Notify recipient if connected
      this.server.to(`user-${data.recipientId}`).emit('newMessage', message);

      // Echo to sender (for multi-device sync if needed, but here just confirmation)
      return message;
    } catch(e) {
      console.error('SendMessage DB Error:', e);
      return { error: 'Failed to save message' };
    }
  }
}
