import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('message_status')
export class MessageStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ID du message concerné
  @Column()
  message_id: string;

  // ID du user qui a reçu/lu le message
  @Column()
  user_id: string;

  // Status: delivered (✅) ou read (✅✅)
  @Column({ type: 'enum', enum: ['delivered', 'read'], default: 'delivered' })
  status: 'delivered' | 'read';

  @CreateDateColumn()
  timestamp: Date;
}