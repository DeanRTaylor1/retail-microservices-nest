import { CreateUserDto, UsersMessage } from '@app/common';
import { GetPagination, Pagination } from '@deanrtaylor/getpagination-nestjs';
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import { HashPasswordPipe } from './interceptors/hash-password.interceptor';

@Controller('users')
export class UsersController {
  constructor(@Inject('USERS_NATS_SERVICE') private natsClient: ClientProxy) {}

  @Get()
  async getUsers(@GetPagination() { skip, limit }: Pagination) {
    const response = this.natsClient.send(UsersMessage.Find_All_Users, {
      skip,
      limit,
    });
    const data = await lastValueFrom(response);
    return data;
  }

  @UseInterceptors(HashPasswordPipe)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    const response = this.natsClient.send(
      UsersMessage.Create_User,
      createUserDto,
    );
    const data = await lastValueFrom(response);

    return data;
  }
}
