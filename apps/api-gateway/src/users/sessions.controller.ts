import { LoginUserDto, UserDTO } from '@app/common';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { Public } from '../decorators/public.decorator';

import { AuthService } from './auth.service';
import { ComparePasswordPipe } from './pipes/authenticate.pipe';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private authService: AuthService) {}

  @ApiBody({ type: LoginUserDto })
  @Public()
  @UsePipes(ComparePasswordPipe)
  @Post()
  async createSession(@Body() data: LoginUserDto & { user: UserDTO }) {
    const { id: userId, email, userRoles } = data.user;

    return await this.authService.signIn({ userId, email, userRoles });
  }
}
