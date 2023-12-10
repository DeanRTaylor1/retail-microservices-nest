import { CreateUserDto, NatsServiceNames, UsersMessage } from '@app/common';
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
  async create(@Payload() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return this.usersService.convertToUserDTO(user);
  }

  @MessagePattern(UsersMessage.Find_All_Users)
  findAll(@Payload() { skip, limit }: Pagination) {
    return this.usersService.findAll({ skip, limit });
  }

  @MessagePattern(UsersMessage.Find_One_User)
  findOne(@Payload() { id }: { id: number }) {
    return this.usersService.findOne(id);
  }

  @MessagePattern(UsersMessage.Find_By_Email)
  async findByEmail(@Payload() { email }: { email: string }) {
    const user = await this.usersService.findByEmailForAuth(email);

    return this.usersService.convertToUserDTO(user, true);
  }
}
