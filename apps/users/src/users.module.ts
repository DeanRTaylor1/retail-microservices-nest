import { join } from 'path';

import { NatsServiceNames } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from './entities/roles.entity';
import { UserRole } from './entities/user-roles.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: NatsServiceNames.Users_Nats_Service,
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
        password: configService.get<string>('DB_PASSWORD', 'secret'),
        database: configService.get<string>('DB_NAME', 'dev_db'),
        entities: [User, UserRole, Role],
        synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', true),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserRole, Role, User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
