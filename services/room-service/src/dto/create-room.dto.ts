import { IsString, IsEnum, IsOptional, IsArray, IsUUID, MinLength } from 'class-validator';

export class CreateRoomDto {
  // Type de room: privée (2 personnes) ou groupe
  @IsEnum(['private', 'group'])
  type: 'private' | 'group';

  // Nom obligatoire uniquement pour les groupes
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  // Liste des IDs des membres à inviter dans la room
  @IsArray()
  @IsUUID('4', { each: true })
  members: string[];
}