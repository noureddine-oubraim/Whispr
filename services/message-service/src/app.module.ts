import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { MessageStatus } from './entities/message-status.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'whispr_db',
      entities: [Message, MessageStatus],
      synchronize: true,
    }),

    TypeOrmModule.forFeature([Message, MessageStatus]),

    JwtModule.register({
      secret: 'whispr_secret_key',
    }),
  ],
  controllers: [MessageController],
  providers: [MessageService, JwtStrategy],
})
export class AppModule {}