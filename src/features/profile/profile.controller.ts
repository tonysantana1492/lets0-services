import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Transactional } from '@nestjs-cls/transactional';
import { Types } from 'mongoose';

import { Protected } from '@/common/auth/decorators/protected.decorator';
import { Public } from '@/common/auth/decorators/public.decorator';
import { IRequestWithUser } from '@/common/auth/interfaces/request-with-user.interface';
import { ResponseHttp } from '@/common/response/decorators/response.decorator';
import { SubdomainValidateQueryDto } from '@/common/workspace/dtos/subdomain-validate.dto';
import { ProfileCreateBodyDto } from '@/features/profile/dtos/profile-create.dto';
import { ProfileUpdateBodyDto } from '@/features/profile/dtos/profile-update.dto';
import { ProfileValidateIdDto } from '@/features/profile/dtos/profile-validate-id.dto';
import { ProfileService } from '@/features/profile/profile.service';
import { ProfileEntity } from '@/features/profile/repository/entities/profile.entity';

@Controller('profiles')
@ApiTags('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @Public()
  @ResponseHttp()
  async getBySubdomain(@Query() { subdomain }: SubdomainValidateQueryDto) {
    const profile = await this.profileService.getBySubdomain(subdomain);

    return {
      data: {
        profile,
      },
    };
  }

  @Get(':profileId')
  @Public()
  @ResponseHttp()
  async getById(@Param() { profileId }: ProfileValidateIdDto) {
    const profile = await this.profileService.getById(profileId);
    return {
      data: {
        profile,
      },
    };
  }

  @Post()
  @Protected()
  @ResponseHttp()
  @Transactional()
  async createProfile(
    @Req() { user }: IRequestWithUser,
    @Body() profileCreateBodyDto: ProfileCreateBodyDto,
  ) {
    const { subdomain, hasSubdomain } = await this.profileService.createProfile(
      (user.workspaceId as Types.ObjectId).toHexString(),
      profileCreateBodyDto,
    );

    return {
      data: {
        subdomain,
        hasSubdomain,
      },
    };
  }

  @Patch(':profileId')
  @Protected()
  @ResponseHttp('', { serialization: ProfileEntity })
  async updateProfile(
    @Param() { profileId }: ProfileValidateIdDto,
    @Body() profileUpdateBodyDto: ProfileUpdateBodyDto,
  ) {
    const profile = await this.profileService.updateProfile({
      id: profileId,
      profileUpdateBodyDto,
    });

    return {
      data: {
        profile,
      },
    };
  }

  // @Delete(':profileId')
  // @Protected()
  // @DocRequest({ params: ProfileValidateIdDto })
  // @ResponseHttp()
  // async deleteProfile(@Param() { profileId }: ProfileValidateIdDto) {
  //   const profile = await this.profileService.deleteProfile(profileId);
  //   return {
  //     data: {
  //       profile,
  //     },
  //   };
  // }
}
