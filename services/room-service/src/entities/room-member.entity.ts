import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Room } from './room.entity';

@Entity('room_members')
export class RoomMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Référence vers la room
  @ManyToOne(() => Room, room => room.members)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column()
  room_id: string;

  // ID du user membre (vient de la table users)
  @Column()
  user_id: string;

  // Rôle dans le groupe: admin ou membre simple
  @Column({ type: 'enum', enum: ['admin', 'member'], default: 'member' })
  role: 'admin' | 'member';

  @CreateDateColumn()
  joined_at: Date;
}