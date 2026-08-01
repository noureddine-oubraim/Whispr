import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { MessageStatus } from './entities/message-status.entity';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    @InjectRepository(MessageStatus)
    private statusRepository: Repository<MessageStatus>,
  ) {}

  // ─── ENVOYER UN MESSAGE ──────────────────────────────────────
  async sendMessage(senderId: string, dto: SendMessageDto) {
    // Crée et sauvegarde le message en base
    const message = this.messageRepository.create({
      room_id: dto.room_id,
      sender_id: senderId,
      content: dto.content,
      type: dto.type || 'text',
      media_url: dto.media_url,
      reply_to_id: dto.reply_to_id,
    });

    await this.messageRepository.save(message);
    return message;
  }

  // ─── RÉCUPÉRER LES MESSAGES D'UNE ROOM ──────────────────────
  async getRoomMessages(roomId: string, page: number = 1) {
    const limit = 50; // 50 messages par page
    const skip = (page - 1) * limit; // Pagination: page 1 = 0, page 2 = 50, etc.

    const messages = await this.messageRepository.find({
      where: { room_id: roomId },
      order: { created_at: 'DESC' }, // Plus récents en premier
      take: limit,
      skip,
    });

    return messages;
  }

  // ─── MARQUER UN MESSAGE COMME LU ────────────────────────────
  async markAsRead(userId: string, messageId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message introuvable');

    // Vérifie si un status existe déjà pour ce user/message
    const existing = await this.statusRepository.findOne({
      where: { message_id: messageId, user_id: userId },
    });

    if (existing) {
      // Met à jour le status existant
      existing.status = 'read';
      await this.statusRepository.save(existing);
      return existing;
    }

    // Crée un nouveau status
    const status = this.statusRepository.create({
      message_id: messageId,
      user_id: userId,
      status: 'read',
    });

    await this.statusRepository.save(status);
    return status;
  }

  // ─── RÉCUPÉRER LE STATUS D'UN MESSAGE ───────────────────────
  async getMessageStatus(messageId: string) {
    return this.statusRepository.find({
      where: { message_id: messageId },
    });
  }
}