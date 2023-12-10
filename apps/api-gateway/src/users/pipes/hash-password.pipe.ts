import { CreateUserDto } from '@app/common';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';

import { AuthService } from '../auth.service';

@Injectable()
export class HashPasswordPipe implements PipeTransform {
  private logger = new Logger(HashPasswordPipe.name);
  constructor(private authService: AuthService) {}
  async transform(value: CreateUserDto, _metadata: ArgumentMetadata) {
    if (!value.password) {
      throw new BadRequestException('Password field is required');
    }

    const hashedPassword = await this.authService.encrypt(value.password);
    return {
      ...value,
      password: hashedPassword,
    };
  }
}
