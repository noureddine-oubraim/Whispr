import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { Room } from './entities/room.entity';
import { RoomMember } from './entities/room-member.entity';
import { JwtStrategy } from './strategies/jwt.strategy';


@Module({
  imports: [
    // Connexion à PostgreSQL — même base que les autres services
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'whispr_db',
      entities: [Room, RoomMember],
      synchronize: true,
    }),

    // Enregistre les deux entités pour ce module
    TypeOrmModule.forFeature([Room, RoomMember]),

    // JWT — même clé pour valider les tokens
    JwtModule.register({
      secret: 'whispr_secret_key',
    }),
  ],
  controllers: [RoomController],
  providers: [RoomService, JwtStrategy],
})
export class AppModule {}