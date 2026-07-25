import { IsString, MinLength, IsOptional, IsEmail } from 'class-validator';

export class LoginDto {
  // L'utilisateur envoie soit email, soit username — pas forcément les deux
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  @MinLength(6)
  password: string;
}