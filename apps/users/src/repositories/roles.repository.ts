import { UserRoles } from '@app/common/users/enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from '../entities/roles.entity';

@Injectable()
export class RolesRepository {
  constructor(@InjectRepository(Role) private roleModel: Repository<Role>) {}

  public async getDefaultRole(usersRole?: UserRoles) {
    let role: Role;
    if (!usersRole) {
      role = await this.roleModel.findOneBy({
        name: UserRoles.Customer,
      });
    } else {
      role = await this.roleModel.findOneBy({
        name: usersRole,
      });
    }

    return role;
  }
}
