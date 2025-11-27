import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Transactional } from '@nestjs-cls/transactional';

import { DocRequest } from '@/common/doc/decorators/doc.decorator';
import { TestEmailBodyDto } from '@/common/user/dto/test-email.dto';

import { Protected } from '../auth/decorators/protected.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AccountCreatePasswordDto } from '../auth/dto/account-create-password.dto';
import { AccountVerifyDto } from '../auth/dto/account-verify.dto';
import { IRequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { RequestInjectMetadataContext } from '../request/decorators/request.decorator';
import { ResponseHttp } from '../response/decorators/response.decorator';
import { AccountForgotPasswordDto } from './dto/account-forgot-password.dto';
import { AccountResetPasswordDto } from './dto/account-reset-password.dto';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Protected()
  @ResponseHttp()
  @Get()
  async getLoginUser(@Req() { user }: IRequestWithUser) {
    return {
      data: {
        user: this.userService.sanitizeUser(user),
      },
    };
  }

  @Public()
  @RequestInjectMetadataContext()
  @DocRequest({ body: AccountVerifyDto })
  @ResponseHttp()
  @Post('validate-access-token-not-verified-account')
  async validateAccessTokenNotVerifiedAccount(@Body() accountVerifyDto: AccountVerifyDto) {
    const user = await this.userService.validateAccessTokenNotVerifiedAccount(accountVerifyDto);

    return {
      data: {
        user: this.userService.sanitizeUser(user),
      },
    };
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ body: AccountVerifyDto })
  @RequestInjectMetadataContext()
  @Post('validate-access-token-verified-account')
  async validateAccessTokenVerifiedAccount(@Body() accountVerifyDto: AccountVerifyDto) {
    const user = await this.userService.validateAccessTokenVerifiedAccount(accountVerifyDto);

    return {
      data: {
        user: this.userService.sanitizeUser(user),
      },
    };
  }

  @Public()
  @ResponseHttp()
  @RequestInjectMetadataContext()
  @Get('validate-verification-token')
  async validateVerificationToken(@Query() accountVerifyDto: AccountVerifyDto) {
    const user = await this.userService.validateVerificationToken(accountVerifyDto);

    return {
      data: {
        user: this.userService.sanitizeUser(user),
      },
    };
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ body: AccountVerifyDto })
  @RequestInjectMetadataContext()
  @Post('validate-verification-token-not-verified-account')
  async validateVerificationTokenNotVerifiedAccount(@Body() accountVerifyDto: AccountVerifyDto) {
    const user =
      await this.userService.validateVerificationTokenNotVerifiedAccount(accountVerifyDto);

    return {
      data: {
        user: this.userService.sanitizeUser(user),
      },
    };
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ body: AccountVerifyDto })
  @Post('validate-forgot-password-token')
  async validateForgotPasswordToken(@Body() accountVerifyDto: AccountVerifyDto) {
    const user = await this.userService.validateForgotPasswordToken(accountVerifyDto);

    return {
      data: {
        user: this.userService.sanitizeUser(user),
      },
    };
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ body: AccountCreatePasswordDto })
  @RequestInjectMetadataContext()
  @Post('create-password')
  @Transactional()
  async createInitialPassword(
    @Body() accountCreatePasswordDto: AccountCreatePasswordDto,
  ): Promise<void> {
    await this.userService.createInitialPassword(accountCreatePasswordDto);
  }

  @Public()
  @Post('forgot-password')
  @ResponseHttp()
  @RequestInjectMetadataContext()
  @Transactional()
  async forgotPassword(@Body() accountForgotPasswordDto: AccountForgotPasswordDto) {
    const accessTokenForVerifiedAccount =
      await this.userService.forgotPassword(accountForgotPasswordDto);

    return {
      data: {
        token: accessTokenForVerifiedAccount,
      },
    };
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ body: AccountResetPasswordDto })
  @Post('reset-forgot-password')
  @Transactional()
  async resetForgotPassword(
    @Body() accountResetPasswordDto: AccountResetPasswordDto,
  ): Promise<void> {
    await this.userService.resetForgotPassword(accountResetPasswordDto);
  }

  @Protected()
  @ResponseHttp()
  @DocRequest({ body: TestEmailBodyDto })
  @RequestInjectMetadataContext()
  @Post('test-email')
  async sendTestEmail(
    @Req() { user }: IRequestWithUser,
    @Body() testEmailBodyDto: TestEmailBodyDto,
  ): Promise<void> {
    await this.userService.sedTestEmail({ testEmailBodyDto, user });
  }
}
