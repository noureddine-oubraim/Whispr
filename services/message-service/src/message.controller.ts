import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  // POST /messages — envoyer un message
  @Post()
  @UseGuards(JwtAuthGuard)
  async sendMessage(@CurrentUser() user: any, @Body() dto: SendMessageDto) {
    return this.messageService.sendMessage(user.id, dto);
  }

  // GET /messages/:roomId — récupérer les messages d'une room
  // ?page=1 pour la pagination
  @Get('room/:roomId')
  @UseGuards(JwtAuthGuard)
  async getRoomMessages(
    @Param('roomId') roomId: string,
    @Query('page') page: string = '1',
  ) {
    return this.messageService.getRoomMessages(roomId, parseInt(page));
  }

  // PUT /messages/:id/read — marquer un message comme lu
  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@CurrentUser() user: any, @Param('id') messageId: string) {
    return this.messageService.markAsRead(user.id, messageId);
  }

  // GET /messages/:id/status — voir le status d'un message
  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  async getMessageStatus(@Param('id') messageId: string) {
    return this.messageService.getMessageStatus(messageId);
  }
}