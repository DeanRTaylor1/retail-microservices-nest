import { CreateUserDto } from '@app/common';
import { Pagination } from '@deanrtaylor/getpagination-nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';

import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectRepository(User) private userModel: Repository<User>) {}
  async create(createUserDto: CreateUserDto, queryRunner: QueryRunner) {
    let user = new User();

    user.username = createUserDto.username;
    user.email = createUserDto.email;
    user.password = createUserDto.password;

    user = await queryRunner.manager.save(user);

    await queryRunner.manager.save(user);

    return user;
  }

  findAll({ skip, limit }: Partial<Pagination>) {
    return this.userModel
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoin('userRole.role', 'role')
      .addSelect('role.name')
      .skip(skip)
      .take(limit)
      .getMany();
  }

  findOne(id: number) {
    return this.userModel.findOneBy({ id });
  }

  findByEmailForAuth(email: string) {
    return this.userModel
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoin('userRole.role', 'role')
      .addSelect('role.name')
      .where('user.email = :email', { email })
      .getOne();
  }
}
