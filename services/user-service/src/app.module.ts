import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Connexion à PostgreSQL — même base que auth-service
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'whispr_db',
      entities: [User],
      synchronize: true,
    }),

    // Enregistre l'entité User pour ce module
    TypeOrmModule.forFeature([User]),

    // JWT — même clé secrète que auth-service pour valider les tokens
    JwtModule.register({
      secret: 'whispr_secret_key',
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
})
export class AppModule {}