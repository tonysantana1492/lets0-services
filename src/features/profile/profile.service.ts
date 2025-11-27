import { Injectable } from '@nestjs/common';

import { Types } from 'mongoose';

import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { WorkspaceService } from '@/common/workspace/workspace.service';
import { PROFILE } from '@/features/profile/data/profile';
import { ProfileCreateBodyDto } from '@/features/profile/dtos/profile-create.dto';
import { ProfileUpdateBodyDto } from '@/features/profile/dtos/profile-update.dto';
import { ProfileDoc } from '@/features/profile/repository/entities/profile.entity';
import { ProfileModel } from '@/features/profile/repository/models/profile.model';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileModel: ProfileModel,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async getById(id: string): Promise<ProfileDoc> {
    return await this.profileModel.findOneById(id);
  }

  async getBySubdomain(subdomain: string): Promise<ProfileDoc> {
    const workspace = await this.workspaceService.getWorkSpaceBySubdomain(subdomain);

    if (!workspace.defaultProfileId) {
      throw new AppRequestException(ERROR_CODES.WORKSPACE_DEFAULT_PROFILE_NOT_FOUND);
    }

    // @ts-expect-error
    const profile = await this.getById(workspace.defaultProfileId.toHexString());

    return profile;
  }

  async createProfile(
    workspaceId: string,
    profileCreateBody: ProfileCreateBodyDto,
  ): Promise<{ subdomain: string; hasSubdomain?: boolean }> {
    const workspace = await this.workspaceService.findById(workspaceId);

    if (workspace.subdomain) {
      return { hasSubdomain: true, subdomain: workspace.subdomain };
    }

    await this.workspaceService.updateSubdomain({
      workspaceId,
      subdomain: profileCreateBody.subdomain,
    });

    const profile = await this.profileModel.create({
      ...PROFILE,
      workspaceId: new Types.ObjectId(workspaceId),
    });

    const profilesCount = await this.profileModel.getTotal({
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (profilesCount === 0) {
      await this.workspaceService.setDefaultProfileForWorkspace({
        workspaceId,
        profileId: profile.id,
      });
    }

    return { subdomain: profileCreateBody.subdomain, hasSubdomain: false };
  }

  async updateProfile({
    id,
    profileUpdateBodyDto,
  }: {
    id: string;
    profileUpdateBodyDto: ProfileUpdateBodyDto;
  }): Promise<ProfileDoc> {
    const profile = await this.profileModel.updateOne(
      { _id: new Types.ObjectId(id) },
      profileUpdateBodyDto,
    );

    return profile;
  }

  // async deleteProfile(id: string): Promise<ProfileDoc> {
  //   // TODO: Validate that the profile is not set as default in the workspace
  //   return this.profileModel.softDeleteById(id);
  // }
}
