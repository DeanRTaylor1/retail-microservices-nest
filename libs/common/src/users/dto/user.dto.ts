import { UserRoles } from '@app/common/users/enum';

export class UserDTO {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  userRoles: Partial<UserRoleDTO>[];
}

export class UserRoleDTO {
  id: number;
  roleId?: number;
  roles?: Array<Partial<RoleDTO>>;
  userId?: number;
}

export class RoleDTO {
  id: number;
  name: UserRoles;
}
