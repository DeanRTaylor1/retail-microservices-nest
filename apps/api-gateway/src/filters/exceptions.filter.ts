import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Something went wrong';

    const simplifiedMessage =
      typeof message === 'object'
        ? (message as HttpException).message
        : message;

    const errorResponse = {
      code: status,
      message: simplifiedMessage,
      path: request.url,
      method: request.method,
    };

    const env = this.configService.get('NODE_ENV');
    if (env === 'development') {
      errorResponse['timestamp'] = new Date().toISOString();
      errorResponse['stack'] = exception['stack'];
    }

    response.status(status).json(errorResponse);
  }
}
