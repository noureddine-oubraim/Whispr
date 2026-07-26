import { IsString, IsOptional, Matches, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9._]{3,20}$/, {
    message: 'Username: lettres, chiffres, point et _ uniquement (3-20 caractères)',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  display_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  bio?: string;
}