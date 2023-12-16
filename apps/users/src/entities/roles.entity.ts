import { UserRoles } from '@app/common/users/enum';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { UserRole } from './user-roles.entity';

@Entity({ name: 'users_roles', synchronize: true })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.Customer })
  name: UserRoles;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
