import { CreateUserDto } from '@app/common';
import { UserDTO, UserRoleDTO } from '@app/common/users/dto/user.dto';
import { UserRoles } from '@app/common/users/enum';
import { Pagination } from '@deanrtaylor/getpagination-nestjs';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';

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
    const users = await this.userRepository.find();
    if (users.length > 0) {
      return;
    }
    await this.createDefaultRoles();
    await this.createRandomUsersWithRoles();
  }

  async create(createUserDto: CreateUserDto, usersRole?: UserRoles) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let user = new User();
      user.username = createUserDto.username;
      user.email = createUserDto.email;
      user.password = createUserDto.password;

      user = await queryRunner.manager.save(user);

      await queryRunner.manager.save(user);

      let role: Role;
      if (!role) {
        role = await this.roleRepository.findOneBy({
          name: UserRoles.Customer,
        });
      } else {
        role = await this.roleRepository.findOneBy({
          name: usersRole,
        });
      }

      this.createUserWithRoles({ user, role, queryRunner });

      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

  findByEmailForAuth(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoin('userRole.role', 'role')
      .addSelect('role.name')
      .where('user.email = :email', { email })
      .getOne();
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  public convertToUserDTO(user: User, requirePassword?: boolean): UserDTO {
    const dto = new UserDTO();
    dto.id = user.id;
    dto.username = user.username;
    dto.email = user.email;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    if (user.userRoles) {
      dto.userRoles = user.userRoles.map((userRole) =>
        this.convertToUserRoleDTO(userRole),
      );
    }
    if (requirePassword && user.password) {
      dto.password = user.password;
    }
    return dto;
  }

  public convertToUserRoleDTO(userRole: UserRole) {
    return userRole.role.name as unknown as UserRoleDTO;
  }

  public async createUserWithRoles({
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

    const customerRole = await this.roleRepository.findOneBy({
      name: UserRoles.Customer,
    });

    try {
      for (let i = 0; i < 100; i++) {
        const user = User.createRandomUser();
        await queryRunner.manager.save(user);

        this.createUserWithRoles({ user, role: customerRole, queryRunner });
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
