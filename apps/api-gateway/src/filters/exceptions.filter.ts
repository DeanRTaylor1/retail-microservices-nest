import {
  ArgumentsHost,
  BadRequestException,
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

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Something went wrong';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    }

    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();
      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        message = exceptionResponse['message'] as string;
      }
    }

    const errorResponse = {
      code: status,
      message: message,
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
