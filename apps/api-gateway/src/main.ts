import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get('PORT');
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api/v1');

  await app.listen(port, () => {
    console.log('App is listening on port: ', port);
  });
}

bootstrap();
