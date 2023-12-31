import { CreateUserDto, NatsServiceNames, UsersMessage } from '@app/common';
import { UserRoles } from '@app/common/users/enum';
import { GetPagination, Pagination } from '@deanrtaylor/getpagination-nestjs';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';

import { Public } from '../decorators/public.decorator';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { SwaggerApiTags } from '../utils/api-tags.enum';

import { HashPasswordPipe } from './pipes/hash-password.pipe';

@ApiTags(SwaggerApiTags.Users_Api)
@Controller('users')
export class UsersController {
  private logger = new Logger(UsersController.name);
  constructor(
    @Inject(NatsServiceNames.Users_Nats_Service)
    private natsClient: ClientProxy,
  ) {}

  @Public()
  @Get()
  async getUsers(@GetPagination() { skip, limit }: Pagination) {
    const response = this.natsClient.send(UsersMessage.Find_All_Users, {
      skip,
      limit,
    });
    const data = await lastValueFrom(response);
    return data;
  }

  @Public()
  @ApiBody({ type: CreateUserDto })
  @UsePipes(HashPasswordPipe)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    this.logger.log(createUserDto);
    const response = this.natsClient.send(
      UsersMessage.Create_User,
      createUserDto,
    );
    const data = await lastValueFrom(response);

    return data;
  }

  @Roles(UserRoles.Customer)
  @UseGuards(RolesGuard)
  @Get(':id')
  async getUserById(@Param('id') id: number) {
    const response = this.natsClient.send(UsersMessage.Find_One_User, { id });

    const user = await lastValueFrom(response);
    if (!user) {
      throw new BadRequestException('User Not Found');
    }

    return user;
  }
}
