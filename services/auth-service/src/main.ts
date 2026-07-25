import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Active la validation globale des DTOs (class-validator)
  // Sans ça, les @IsEmail(), @IsString() etc. ne fonctionnent pas
  app.useGlobalPipes(new ValidationPipe());

  // L'auth-service tourne sur le port 3001
  // (3000 sera réservé pour un API Gateway plus tard)
  await app.listen(3001);
  console.log('Auth service running on port 3001');
}

bootstrap();