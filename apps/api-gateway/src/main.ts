import { join } from 'path';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

class NestApp {
  private app: INestApplication;
  public port: string | number = process.env.PORT || 8080;
  private configService: ConfigService;
  private readonly globalPrefix = `api/${process.env.apiVersion ?? 'v1'}`;
  private logger: Logger;
  private logDir = process.env.logDir
    ? join(__dirname, process.env.logDir)
    : join(__dirname, 'logs/');

  constructor() {
    this.bootstrap();
  }

  private async bootstrap() {
    this.app = await NestFactory.create(AppModule, { bufferLogs: true });
    this.logger = this.app.get(Logger);

    this.app.useLogger(this.logger);

    this.configService = this.app.get(ConfigService);

    this.registerMiddleware();
    this.serveSwagger();
    this.listen();
  }

  private registerMiddleware() {
    this.app.enableCors();
    this.app.useGlobalPipes(new ValidationPipe());
    this.app.setGlobalPrefix(this.globalPrefix);
  }
  //test
  private serveSwagger() {
    const config = new DocumentBuilder()
      .setTitle('Api Gateway - Retail Microsrevices')
      .setDescription('Swagger docs for api gateway http service')
      .setVersion('1.0')
      .addTag('apigateway')
      .build();

    const document = SwaggerModule.createDocument(this.app, config);
    SwaggerModule.setup(`${this.globalPrefix}/docs`, this.app, document);
  }

  private async listen() {
    await this.app.listen(this.port);
    this.logger.log(
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    );
    this.logger.log(
      ` Application is running on: http://localhost:${this.port}/${this.globalPrefix}.`,
    );
    this.logger.log('');
    this.logger.log(
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    );
  }
}

new NestApp();
