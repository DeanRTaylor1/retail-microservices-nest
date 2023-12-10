import { join } from 'path';

import { NatsServiceNames } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllExceptionsFilter } from './filters/exceptions.filter';
import { ResponsesInterceptor } from './interceptors/responses.interceptor';
import { RouteLoggerInterceptor } from './interceptors/route-logger.interceptor';
import { AuthService } from './users/auth.service';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
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
    LoggerModule.forRoot(),
    PrometheusModule.register(),
  ],
  controllers: [AppController, UsersController],
  providers: [
    AppService,
    AuthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RouteLoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponsesInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
