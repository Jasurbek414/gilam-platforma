import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: any) {
    const message = this.messageRepository.create(createMessageDto);
    return await this.messageRepository.save(message);
  }

  async findAllByConversation(userId1: string, userId2: string) {
    return await this.messageRepository.find({
      where: [
        { senderId: userId1, recipientId: userId2 },
        { senderId: userId2, recipientId: userId1 },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender'],
    });
  }

  async getConversations(userId: string) {
    // Basic logic to get unique speakers for a user
    const sent = await this.messageRepository.find({ where: { senderId: userId }, relations: ['recipient'] });
    const received = await this.messageRepository.find({ where: { recipientId: userId }, relations: ['sender'] });
    
    const others = new Set();
    const results = [];
    
    [...sent.map(m => m.recipient), ...received.map(m => m.sender)].forEach(user => {
      if (user && user.id !== userId && !others.has(user.id)) {
        others.add(user.id);
        results.push(user);
      }
    });

    return results;
  }
}
