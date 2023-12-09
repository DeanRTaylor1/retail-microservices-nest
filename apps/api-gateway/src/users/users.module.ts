import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AppController } from '../app.controller';
import { AppService } from '../app.service';

import { AuthService } from './auth.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ConfigModule,
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
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, AuthService],
  exports: [UsersController, AuthService],
})
export class AppModule {}
