import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RouteLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RouteLoggerInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { url, ip, method, headers } = request;

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        if (process.env.NODE_ENV !== 'production') {
          const statusCode = context.switchToHttp().getResponse().statusCode;
          const logData = {
            status: statusCode,
            responseTime: Date.now() - now,
            ipAddress: ip,
            method: method,
            url,
            userAgent: headers['user-agent'],
            userId: request.user ? request.user.id : null,
          };
          this.logger.debug(logData, 'Request Completed');
        }
      }),
    );
  }
}
