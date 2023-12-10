import { LoginUserDto, NatsServiceNames, UsersMessage } from '@app/common';
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import { AuthService } from '../auth.service';

@Injectable()
export class ComparePasswordPipe implements PipeTransform {
  constructor(
    private authService: AuthService,
    @Inject(NatsServiceNames.Users_Nats_Service)
    private natsClient: ClientProxy,
  ) {}

  async transform(value: LoginUserDto, _metadata: ArgumentMetadata) {
    const { email, password } = value;

    if (!password || !email) {
      throw new BadRequestException(
        'Password and username fields are required',
      );
    }

    const response = this.natsClient.send(UsersMessage.Find_By_Email, {
      email,
    });

    const user = await lastValueFrom(response);
    if (!user) {
      throw new UnauthorizedException(UnauthorizedException);
    }
    const isMatch = await this.authService.compare({
      storedPassword: user.password,
      suppliedPassword: password,
    });

    if (!isMatch) {
      throw new UnauthorizedException('Incorrect password');
    }

    return { ...value, password: user.password, user };
  }
}
