import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { Public } from '@/common/auth/decorators/public.decorator';
import { DocRequest } from '@/common/doc/decorators/doc.decorator';
import {
  AuthCallbackQueryDto,
  GenerateOAuth2UrlQueryDto,
} from '@/common/google/oauth2/dto/google-auth.dto';
import {
  RequestInjectMetadataContext,
  RequestMetadata,
} from '@/common/request/decorators/request.decorator';
import { IRequestMetadata } from '@/common/request/interfaces/request-metadata.interface';
import { ResponseHttp } from '@/common/response/decorators/response.decorator';
import { IResponseDefault } from '@/common/response/interfaces/response.interface';

import { GoogleAuthService } from './google-auth.service';

@Controller('google')
@ApiTags('google')
export class GoogleAuthController {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private appConfigService: AppConfigService,
  ) {}

  @Public()
  @RequestInjectMetadataContext()
  @ResponseHttp()
  @DocRequest({
    queries: GenerateOAuth2UrlQueryDto,
  })
  @Get('generate-oauth2-url')
  async generateOAuth2Url(@Query() query: GenerateOAuth2UrlQueryDto, @Res() res: IResponseDefault) {
    const url = await this.googleAuthService.generateOAuth2Url(query);

    res.redirect(url);
  }

  @Public()
  @RequestInjectMetadataContext()
  @ResponseHttp()
  @Get('callback')
  async googleCallback(
    @Query() query: AuthCallbackQueryDto,
    @Res() res: IResponseDefault,
    @RequestMetadata() requestMetadata: IRequestMetadata,
  ) {
    const { client } = this.appConfigService.appConfig;

    const {
      verificationToken,
      accessTokenCookie,
      refreshTokenCookie,
      fingerprintCookie,
      redirectTo,
    } = await this.googleAuthService.authCallback({
      query,
      requestMetadata,
    });

    res.setHeader('Set-Cookie', [
      accessTokenCookie,
      refreshTokenCookie,
      fingerprintCookie,
      redirectTo,
    ]);

    const redirectUrlWithToken = new URL(redirectTo);

    //'http://localhost:4000/?subdomain=tony2&socialNetworkUrl=tony&token=3vf5vf56vfmhd'
    redirectUrlWithToken.searchParams.append('token', verificationToken);

    res.redirect(
      `${client.url}/api/google-oauth-callback?redirectTo=${encodeURIComponent(redirectUrlWithToken.toString())}`,
    );
  }
}
