import { Injectable } from '@nestjs/common';

import { OAuth2Client } from 'google-auth-library';
import { google, oauth2_v2 } from 'googleapis';
import { Types } from 'mongoose';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { AuthService } from '@/common/auth/auth.service';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import {
  AuthCallbackQueryDto,
  GenerateOAuth2UrlQueryDto,
} from '@/common/google/oauth2/dto/google-auth.dto';
import { IRequestMetadata } from '@/common/request/interfaces/request-metadata.interface';
import { ICreateGoogleUser } from '@/common/user/interfaces/create-google-user.interface';
import { UserService } from '@/common/user/user.service';
import { WorkspaceService } from '@/common/workspace/workspace.service';

@Injectable()
export class GoogleAuthService {
  private oAuth2Client: OAuth2Client;

  constructor(
    private readonly userService: UserService,
    private readonly workspaceService: WorkspaceService,
    private readonly appConfigService: AppConfigService,
    private authService: AuthService,
  ) {
    const { clientId, clientSecret, callbackUrl } = this.appConfigService.googleConfig;

    this.oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, callbackUrl);
  }

  public getOAuth2Client(): OAuth2Client {
    return this.oAuth2Client;
  }

  async getUserData(token: string) {
    const userInfoClient = google.oauth2('v2').userinfo;

    this.oAuth2Client.setCredentials({
      access_token: token,
    });

    const userInfoResponse = await userInfoClient.get({
      auth: this.oAuth2Client,
    });

    return userInfoResponse.data;
  }

  public async processGoogleUser({ profile }: ICreateGoogleUser) {
    // Check if the google user exists
    const email = profile.email as string;
    const userFound = await this.userService.getByEmail(email);

    if (userFound) return userFound;

    // Create google user
    const user = await this.registerUser(profile);

    return user;
  }

  public async registerUser(profile: oauth2_v2.Schema$Userinfo) {
    const workspace = await this.workspaceService.createWorkspace({
      name: profile.given_name as string,
    });

    const user = await this.userService.createUser({
      email: profile.email as string,
      firstName: profile.given_name as string,
      lastName: profile.family_name as string,
      isRegisteredWithGoogle: true,
      emailVerified: true,
      avatar: profile.picture as string,
      workspaceId: new Types.ObjectId(workspace._id),
    });

    await this.workspaceService.updateWorkspaceOwner({
      workspaceId: workspace.id,
      ownerId: user.id,
    });

    await this.userService.sendWelcomeEmail(user);

    return user;
  }

  async getGoogleProfile(accessToken: string) {
    try {
      this.oAuth2Client.setCredentials({ access_token: accessToken });

      const oauth2 = google.oauth2({
        auth: this.oAuth2Client,
        version: 'v2',
      });

      const res = await oauth2.userinfo.get();
      return res.data;
    } catch (error) {
      throw new AppRequestException({
        ...ERROR_CODES.GMAIL_GET_USER_PROFILE_ERROR,
        errors: [error],
      });
    }
  }

  // This is where I need to generate the query params that will be received in callback hook
  async generateOAuth2Url(query: GenerateOAuth2UrlQueryDto) {
    const { accessType, scope } = this.appConfigService.googleConfig;

    const oAuth2Client = this.getOAuth2Client();

    try {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: accessType,
        scope,
        state: JSON.stringify({
          subscriptionPlan: query.subscriptionPlan,
          fingerprint: query.fingerprint,
          redirectTo: query.redirectTo,
        }),
      });

      return authUrl;
    } catch (error) {
      throw new AppRequestException({
        ...ERROR_CODES.GMAIL_OAUTH_URL_ERROR,
        errors: [error],
      });
    }
  }

  async authCallback({
    query,
    requestMetadata,
  }: {
    query: AuthCallbackQueryDto;
    requestMetadata: IRequestMetadata;
  }) {
    const oAuth2Client = this.getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(query.code);

    const { fingerprint, subscriptionPlan, redirectTo } = JSON.parse(
      query.state,
    ) as GenerateOAuth2UrlQueryDto;

    const profile = await this.getGoogleProfile(tokens?.access_token ?? '');

    const user = await this.processGoogleUser({
      profile,
      googleAccessToken: tokens.access_token as string,
      googleRefreshToken: tokens.refresh_token as string,
      subscriptionPlan,
    });

    const { verificationToken, accessTokenCookie, refreshTokenCookie, fingerprintCookie } =
      await this.authService.login({
        user,
        requestMetadata,
        fingerprint,
      });

    return {
      verificationToken,
      accessTokenCookie,
      refreshTokenCookie,
      fingerprintCookie,
      redirectTo,
    };
  }
}
