import { join } from 'path';

import { NatsServiceNames } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllExceptionsFilter } from './filters/exceptions.filter';
import { AuthGuard } from './guards/auth.guard';
import { ResponsesInterceptor } from './interceptors/responses.interceptor';
import { RouteLoggerInterceptor } from './interceptors/route-logger.interceptor';
import { AuthService } from './users/auth.service';
import { SessionsController } from './users/sessions.controller';
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
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'root'),
        password: configService.get<string>('DB_PASSWORD', 'secret'),
        database: configService.get<string>('DB_NAME', 'dev_db'),
        entities: [],
        synchronize: false,
        logging:
          configService.get<string>('NODE_ENV', 'development') ===
          'development',
      }),
      inject: [ConfigService],
    }),
    LoggerModule.forRoot(),
    PrometheusModule.register(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get('JWT_SECRET', 'secret'),
          signOptions: { expiresIn: configService.get('JWT_EXPIRES', '24h') },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController, UsersController, SessionsController],
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
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
