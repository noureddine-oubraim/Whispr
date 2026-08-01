import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class SendMessageDto {
  // ID de la room où envoyer le message
  @IsUUID('4')
  room_id: string;

  // Contenu texte (optionnel si c'est un média)
  @IsOptional()
  @IsString()
  content?: string;

  // Type du message (text par défaut)
  @IsOptional()
  @IsEnum(['text', 'image', 'file', 'audio'])
  type?: 'text' | 'image' | 'file' | 'audio';

  // URL du média si type != text
  @IsOptional()
  @IsString()
  media_url?: string;

  // ID du message auquel on répond (reply feature)
  @IsOptional()
  @IsUUID('4')
  reply_to_id?: string;
}