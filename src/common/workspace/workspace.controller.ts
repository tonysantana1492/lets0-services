import { Body, Controller, Get, Param, Put, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Types } from 'mongoose';

import { Public } from '@/common/auth/decorators/public.decorator';
import { SubdomainValidateQueryDto } from '@/common/workspace/dtos/subdomain-validate.dto';
import { WorkspaceSetDefaultProfileDto } from '@/common/workspace/dtos/workspace-set-default-profile.dto';
import { ValidateWorkspaceIdDto } from '@/common/workspace/dtos/workspace-validate-id.dto';

import { Protected } from '../auth/decorators/protected.decorator';
import { IRequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { ResponseHttp } from '../response/decorators/response.decorator';
import { WorkspaceService } from './workspace.service';

@Controller('workspaces')
@ApiTags('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  @Protected()
  @ResponseHttp()
  async getByLoginUser(@Req() { user }: IRequestWithUser) {
    const workspaceId = (user.workspaceId as Types.ObjectId).toString();

    const workspace = await this.workspaceService.findById(workspaceId);
    return {
      data: {
        workspace,
      },
    };
  }

  @Get('validate-subdomain')
  @Public()
  @ResponseHttp()
  async validateSubDomainAvailability(@Query() { subdomain }: SubdomainValidateQueryDto) {
    const isAvailable = await this.workspaceService.validateSubDomainAvailability(subdomain);

    return {
      data: {
        isAvailable,
      },
    };
  }

  @Put(':workspaceId/default-profile')
  @Public()
  @ResponseHttp()
  async getDefaultProfile(
    @Param() { workspaceId }: ValidateWorkspaceIdDto,
    @Body() { profileId }: WorkspaceSetDefaultProfileDto,
  ) {
    await this.workspaceService.setDefaultProfileForWorkspace({ workspaceId, profileId });

    return {
      data: {},
    };
  }
}
