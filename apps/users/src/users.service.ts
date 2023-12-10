import { CreateUserDto } from '@app/common';
import { UserRoles } from '@app/common/users/enum';
import { Pagination } from '@deanrtaylor/getpagination-nestjs';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Role } from './entities/roles.entity';
import { UserRole } from './entities/user-roles.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  private logger = new Logger(UsersService.name);
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async onModuleInit() {
    await this.createDefaultRoles();
    await this.createRandomUsersWithRoles();
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);

    return this.userRepository.save(user);
  }

  findAll({ skip, limit }: Partial<Pagination>) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoin('userRole.role', 'role')
      .addSelect('role.name')
      .skip(skip)
      .take(limit)
      .getMany();
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

  private async createDefaultRoles() {
    const roles = Array.from(Object.values(UserRoles));
    await Promise.all(
      roles.map(async (roleName) => {
        let role = await this.roleRepository.findOneBy({ name: roleName });
        if (!role) {
          role = this.roleRepository.create({ name: roleName });
          await this.roleRepository.save(role);
        }
      }),
    );
  }

  private async createRandomUsersWithRoles() {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (let i = 0; i < 100; i++) {
        const user = User.createRandomUser();
        await queryRunner.manager.save(user);

        const customerRole = await this.roleRepository.findOneBy({
          name: UserRoles.Customer,
        });
        if (customerRole) {
          const userRole = new UserRole();
          userRole.user = user;
          userRole.role = customerRole;
          await queryRunner.manager.save(userRole);
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
