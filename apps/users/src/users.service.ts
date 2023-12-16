import { CreateUserDto } from '@app/common';
import { UserDTO, UserRoleDTO } from '@app/common/users/dto/user.dto';
import { UserRoles } from '@app/common/users/enum';
import { Pagination } from '@deanrtaylor/getpagination-nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { UserRole } from './entities/user-roles.entity';
import { User } from './entities/user.entity';
import { RolesRepository } from './repositories/roles.repository';
import { UserRolesRepository } from './repositories/user-roles.repository';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(
    private dataSource: DataSource,
    private usersRepository: UsersRepository,
    private rolesRepository: RolesRepository,
    private userRolesRepository: UserRolesRepository,
  ) {}

  async create(createUserDto: CreateUserDto, usersRole?: UserRoles) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.usersRepository.create(
        createUserDto,
        queryRunner,
      );

      const role = await this.rolesRepository.getDefaultRole(usersRole);
      this.userRolesRepository.createForUser({ user, role, queryRunner });

      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll({ skip, limit }: Pagination): Promise<Array<User>> {
    return this.usersRepository.findAll({ skip, limit });
  }

  findOne(id: number) {
    return this.usersRepository.findOne(id);
  }

  findByEmailForAuth(email: string) {
    return this.usersRepository.findByEmailForAuth(email);
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
}
