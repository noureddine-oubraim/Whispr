import { IsUUID } from 'class-validator';

export class AddMemberDto {
  // ID du user à ajouter dans le groupe
  @IsUUID('4')
  user_id: string;
}