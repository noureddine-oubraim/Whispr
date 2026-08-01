import { IsUUID } from 'class-validator';

export class MarkReadDto {
  // ID du message à marquer comme lu
  @IsUUID('4')
  message_id: string;
}