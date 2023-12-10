import {
  CreateUserDto,
  NatsServiceNames,
  UpdateUserDto,
  UsersMessage,
} from '@app/common';
import { Pagination } from '@deanrtaylor/getpagination-nestjs';
import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';

import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(NatsServiceNames.Users_Nats_Service)
    private readonly natsClient: ClientProxy,
  ) {}

  @MessagePattern(UsersMessage.Create_User)
  create(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern(UsersMessage.Find_All_Users)
  findAll(@Payload() { skip, limit }: Pagination) {
    return this.usersService.findAll({ skip, limit });
  }

  @MessagePattern(UsersMessage.Find_One_User)
  findOne(@Payload() { id }: { id: number }) {
    return this.usersService.findOne(id);
  }

  @MessagePattern('updateUser')
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto.id);
  }

  @MessagePattern('removeUser')
  remove(@Payload() id: number) {
    return this.usersService.remove(id);
  }
}
