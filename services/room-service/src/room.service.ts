import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomMember } from './entities/room-member.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,

    @InjectRepository(RoomMember)
    private memberRepository: Repository<RoomMember>,
  ) { }

  // ─── CRÉER UNE ROOM ─────────────────────────────────────────
async createRoom(userId: string, dto: CreateRoomDto) {
  // Pour un chat privé, il faut exactement 1 autre membre
  if (dto.type === 'private' && dto.members.length !== 1) {
    throw new BadRequestException('Un chat privé nécessite exactement 1 autre membre');
  }

  // Pour un groupe, il faut un nom
  if (dto.type === 'group' && !dto.name) {
    throw new BadRequestException('Un groupe doit avoir un nom');
  }

  // Vérifie si un chat privé existe déjà entre ces 2 users
  // Évite de créer 2 fois la même conversation
  if (dto.type === 'private') {
    const existing = await this.findPrivateRoom(userId, dto.members[0]);
    if (existing) return existing;
  }

  // Crée la room en base
  const room = this.roomRepository.create({
    type: dto.type,
    name: dto.name,
  });
  await this.roomRepository.save(room);

  // Ajoute le créateur
  // Chat privé → member (pas d'admin), groupe → admin
  await this.memberRepository.save({
    room_id: room.id,
    user_id: userId,
    role: dto.type === 'group' ? 'admin' : 'member',
  });

  // Ajoute les autres membres
  for (const memberId of dto.members) {
    await this.memberRepository.save({
      room_id: room.id,
      user_id: memberId,
      role: 'member',
    });
  }

  return this.getRoomById(room.id, userId);
}

  // ─── RÉCUPÉRER TOUTES LES ROOMS D'UN USER ───────────────────
  async getUserRooms(userId: string) {
    // Cherche toutes les rooms où le user est membre
    const memberships = await this.memberRepository.find({
      where: { user_id: userId },
      relations: { room: { members: true } },
    });

    return memberships.map(m => m.room);
  }

  // ─── RÉCUPÉRER UNE ROOM PAR ID ──────────────────────────────
  async getRoomById(roomId: string, userId: string) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: {members: true},
    });

    if (!room) throw new NotFoundException('Room introuvable');

    // Vérifie que le user est bien membre de cette room
    const isMember = room.members.some(m => m.user_id === userId);
    if (!isMember) throw new ForbiddenException('Accès refusé');

    return room;
  }

  // ─── AJOUTER UN MEMBRE À UN GROUPE ──────────────────────────
  async addMember(roomId: string, userId: string, dto: AddMemberDto) {
    const room = await this.getRoomById(roomId, userId);

    // Seuls les groupes acceptent de nouveaux membres
    if (room.type === 'private') {
      throw new BadRequestException('Impossible d\'ajouter un membre à un chat privé');
    }

    // Vérifie que le user est admin du groupe
    const member = await this.memberRepository.findOne({
      where: { room_id: roomId, user_id: userId },
    });
    if (member?.role !== 'admin') throw new ForbiddenException('Seul un admin peut ajouter des membres');

    // Ajoute le nouveau membre
    await this.memberRepository.save({
      room_id: roomId,
      user_id: dto.user_id,
      role: 'member',
    });

    return { message: 'Membre ajouté avec succès' };
  }

  // ─── TROUVER UN CHAT PRIVÉ EXISTANT ─────────────────────────
  private async findPrivateRoom(userId1: string, userId2: string) {
    // Cherche une room privée où les 2 users sont membres
    const member1Rooms = await this.memberRepository.find({
      where: { user_id: userId1 },
    });

    for (const m of member1Rooms) {
      const room = await this.roomRepository.findOne({
        where: { id: m.room_id, type: 'private' },
        relations: { members: true },
      });
      if (room && room.members.some(m => m.user_id === userId2)) {
        return room;
      }
    }
    return null;
  }
}