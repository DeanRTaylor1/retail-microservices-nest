import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponsesInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    if (request.url === '/api/v1/metrics') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        data,
        message: 'Operation successful',
      })),
    );
  }
}
