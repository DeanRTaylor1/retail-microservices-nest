import { NatsServiceNames } from '@app/common';
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
        name: NatsServiceNames.Users_Nats_Service,
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
