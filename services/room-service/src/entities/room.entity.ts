import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { RoomMember } from './room-member.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Type de la room: privée (2 personnes) ou groupe
  @Column({ type: 'enum', enum: ['private', 'group'] })
  type: 'private' | 'group';

  // Nom uniquement pour les groupes (null pour les chats privés)
  @Column({ nullable: true })
  name: string;

  // Photo du groupe (optionnelle)
  @Column({ nullable: true })
  avatar_url: string;

  @CreateDateColumn()
  created_at: Date;

  // Une room a plusieurs membres
  @OneToMany(() => RoomMember, member => member.room)
  members: RoomMember[];
}