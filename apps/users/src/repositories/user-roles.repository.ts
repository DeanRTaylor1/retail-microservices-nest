import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';

import { Role } from '../entities/roles.entity';
import { UserRole } from '../entities/user-roles.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRolesRepository {
  constructor(
    @InjectRepository(UserRole) private userRoleModel: Repository<Role>,
  ) {}

  public async createForUser({
    user,
    role,
    queryRunner,
  }: {
    user: User;
    role: Role;
    queryRunner: QueryRunner;
  }) {
    const userRole = new UserRole();
    userRole.user = user;
    userRole.role = role;

    await queryRunner.manager.save(userRole);
  }
}
