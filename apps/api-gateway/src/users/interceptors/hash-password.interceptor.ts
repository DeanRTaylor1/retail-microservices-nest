import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from, switchMap } from 'rxjs';

import { AuthService } from '../auth.service';

@Injectable()
export class HashPasswordPipe implements NestInterceptor {
  constructor(private authService: AuthService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { body } = request;
    const { password, ...rest } = body;
    return from(this.authService.encrypt(password)).pipe(
      switchMap((hashedPassword) => {
        request.body = { ...rest, password: hashedPassword };

        return next.handle();
      }),
    );
  }
}
