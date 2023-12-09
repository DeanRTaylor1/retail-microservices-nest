import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './users/auth.service';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://nats'],
          queue: 'users-queue',
        },
      },
    ]),
    ConfigModule.forRoot({
      envFilePath: join(
        process.cwd(),
        `.env.${process.env.NODE_ENV ?? 'development'}.local`,
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
        entities: [],
        synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', true),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, AuthService],
})
export class AppModule {}
