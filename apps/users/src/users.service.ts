import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    console.log('Creating users');
    for (let i = 0; i < 100; i++) {
      const user = User.createRandomUser();
      await this.userRepository.save(user);
    }
    console.log('done');
  }

  create() {
    return 'This action adds a new user';
  }

  findAll({ skip, limit }) {
    return this.userRepository.find({ skip, take: limit });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
