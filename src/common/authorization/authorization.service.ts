import { Injectable } from '@nestjs/common';

import { UserService } from '../user/user.service';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class AuthorizationService {
  constructor(private usersServices: UserService) {}

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    return this.usersServices.updateOneAndReturn(id, updateRoleDto);
  }

  async updatePermission(id: string, updatePermissionsDto: UpdatePermissionsDto) {
    return this.usersServices.updateOneAndReturn(id, updatePermissionsDto);
  }
}
