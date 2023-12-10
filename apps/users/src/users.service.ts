import { CreateUserDto } from '@app/common';
import { Pagination } from '@deanrtaylor/getpagination-nestjs';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  private logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    for (let i = 0; i < 100; i++) {
      const user = User.createRandomUser();
      await this.userRepository.save(user);
    }
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);

    return this.userRepository.save(user);
  }

  findAll({ skip, limit }: Partial<Pagination>) {
    return this.userRepository.find({ skip, take: limit });
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
