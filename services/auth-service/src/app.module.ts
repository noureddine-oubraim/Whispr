import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@nestjs-modules/ioredis';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Connexion à PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'whispr_db',
      entities: [User],
      synchronize: true, // Crée/met à jour les tables automatiquement (dev uniquement)
    }),

    // Enregistre l'entité User pour pouvoir l'utiliser dans AuthService
    TypeOrmModule.forFeature([User]),

    // Configuration JWT
    JwtModule.register({
      secret: 'whispr_secret_key', // À mettre dans .env plus tard
      signOptions: { expiresIn: '15m' },
    }),

    // Connexion à Redis
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AppModule {}