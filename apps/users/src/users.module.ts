import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://nats'],
          queue: 'users_queue',
        },
      },
    ]),
    ConfigModule.forRoot({
      envFilePath: join(
        process.cwd(),
        `.env.${process.env ?? 'development'}.local`,
      ),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'postgres'),
        port: configService.get<number>('Db_PORT', 5432),
        username: configService.get<string>('DB_PORT', 'root'),
        password: configService.get<string>('DB_PORT', 'secret'),
        database: configService.get<string>('DB_NAME', 'dev_db'),
        entities: [User],
        synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', true),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
