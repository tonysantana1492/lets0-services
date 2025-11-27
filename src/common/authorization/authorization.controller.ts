import { Body, Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { DocRequest } from '@/common/doc/decorators/doc.decorator';

import { Protected } from '../auth/decorators/protected.decorator';
import { ResponseHttp } from '../response/decorators/response.decorator';
import { AuthorizationService } from './authorization.service';
import { PermissionsParamsDto, UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ROLE } from './enums/role.enum';

@Controller('authorizations')
@ApiTags('authorizations')
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Protected(ROLE.SUPER_ADMIN)
  @ResponseHttp()
  @HttpCode(204)
  @DocRequest({ params: PermissionsParamsDto, body: UpdateRoleDto })
  @Patch(':userId/role')
  async updateRole(
    @Param() { userId }: PermissionsParamsDto,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const updatedUser = await this.authorizationService.updateRole(userId, updateRoleDto);

    return {
      data: {
        user: updatedUser,
      },
    };
  }

  @Protected(ROLE.SUPER_ADMIN)
  @ResponseHttp()
  @DocRequest({ params: PermissionsParamsDto, body: UpdatePermissionsDto })
  @HttpCode(204)
  @Patch(':userId/permissions')
  async updatePermission(
    @Param() { userId }: PermissionsParamsDto,
    @Body() updatePermissionsDto: UpdatePermissionsDto,
  ) {
    const updatedUser = await this.authorizationService.updatePermission(
      userId,
      updatePermissionsDto,
    );
    return {
      data: {
        user: updatedUser,
      },
    };
  }
}
