import { CreateUserDto, UpdateUserDto, UsersMessage } from '@app/common';
import { Pagination } from '@deanrtaylor/getpagination-nestjs';
import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';

import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject('USERS_NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @MessagePattern('createUser')
  create(@Payload() _createUserDto: CreateUserDto) {
    return this.usersService.create();
  }

  @MessagePattern(UsersMessage.Find_All_Users)
  findAll(@Payload() { skip, limit }: Pagination) {
    return this.usersService.findAll({ skip, limit });
  }

  @MessagePattern('findOneUser')
  findOne(@Payload() id: number) {
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
