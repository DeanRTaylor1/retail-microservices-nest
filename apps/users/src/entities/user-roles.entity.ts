import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { Role } from './roles.entity';
import { User } from './user.entity';

@Entity({ name: 'users_user_roles', synchronize: true })
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Role, (role) => role.userRoles)
  role: Role;

  @ManyToOne(() => User, (user) => user.userRoles)
  user: User;
}
