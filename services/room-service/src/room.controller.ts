import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  // POST /rooms — créer une room privée ou un groupe
  @Post()
  @UseGuards(JwtAuthGuard)
  async createRoom(@CurrentUser() user: any, @Body() dto: CreateRoomDto) {
    return this.roomService.createRoom(user.id, dto);
  }

  // GET /rooms — récupérer toutes les rooms du user connecté
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserRooms(@CurrentUser() user: any) {
    return this.roomService.getUserRooms(user.id);
  }

  // GET /rooms/:id — récupérer une room par son ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getRoomById(@CurrentUser() user: any, @Param('id') roomId: string) {
    return this.roomService.getRoomById(roomId, user.id);
  }

  // POST /rooms/:id/members — ajouter un membre à un groupe
  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  async addMember(
    @CurrentUser() user: any,
    @Param('id') roomId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.roomService.addMember(roomId, user.id, dto);
  }
}