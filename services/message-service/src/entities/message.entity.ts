import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ID de la room où le message a été envoyé
  @Column()
  room_id: string;

  // ID du user qui a envoyé le message
  @Column()
  sender_id: string;

  // Contenu texte du message (null si c'est une image/fichier)
  @Column({ nullable: true })
  content: string;

  // Type du message: texte, image, fichier, audio
  @Column({ type: 'enum', enum: ['text', 'image', 'file', 'audio'], default: 'text' })
  type: 'text' | 'image' | 'file' | 'audio';

  // URL du média si type != text
  @Column({ nullable: true })
  media_url: string;

  // ID du message auquel on répond (reply feature)
  @Column({ nullable: true })
  reply_to_id: string;

  @CreateDateColumn()
  created_at: Date;

  // Date de modification (si le message est édité)
  @UpdateDateColumn()
  edited_at: Date;
}