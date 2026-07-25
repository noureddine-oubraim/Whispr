import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  // Accepte: lettres, chiffres, point, underscore — min 3, max 20 caractères (comme Instagram)
  @Matches(/^[a-zA-Z0-9._]{3,20}$/, {
    message: 'Username: lettres, chiffres, point et _ uniquement (3-20 caractères)',
  })
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}