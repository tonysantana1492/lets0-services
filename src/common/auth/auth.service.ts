import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';

import { Types } from 'mongoose';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { IUserWithSession } from '@/common/auth/interfaces/user-with-session.interface';
import { IJwt } from '@/common/helpers/interfaces/helper.encryption-service.interface';
import { SessionService } from '@/common/session/session.service';

import { ERROR_CODES } from '../error/constants/error-code';
import { AppRequestException } from '../error/exceptions/app-request.exception';
import { ENUM_HELPER_DATE_DIFF } from '../helpers/constants/helper.enum.constant';
import { HelperDateService } from '../helpers/services/helper.date.service';
import { HelperTokenService } from '../helpers/services/helper.token.service';
import { IRequestMetadata } from '../request/interfaces/request-metadata.interface';
import { UserDoc, UserEntity } from '../user/repository/entities/user.entity';
import { UserService } from '../user/user.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { RegisterDto } from './dto/register.dto';
import { ITokenPayload } from './interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly workspaceService: WorkspaceService,
    private readonly helperDateService: HelperDateService,
    private readonly helperTokenService: HelperTokenService,
    private readonly sessionService: SessionService,
    private readonly appConfigService: AppConfigService,
  ) {}

  public async getAllUsers(): Promise<UserDoc[]> {
    const users = await this.userService.getAllUsers();

    return users;
  }

  public async registerUser(registrationData: RegisterDto) {
    const workspace = await this.workspaceService.createWorkspace({
      name: registrationData.firstName,
    });

    const user = await this.userService.createUser({
      ...registrationData,
      isRegisteredWithGoogle: false,
      emailVerified: false,
      workspaceId: new Types.ObjectId(workspace._id),
    });

    const payload: ITokenPayload = {
      userId: user.id,
      email: user.email,
      sessionId: '',
    };

    await this.workspaceService.updateWorkspaceOwner({
      workspaceId: workspace.id,
      ownerId: user.id,
    });

    void this.userService.sendVerificationLinkMail(user);

    return this.helperTokenService.generateAccessToken(payload);
  }

  async login({
    user,
    requestMetadata,
    fingerprint,
  }: {
    user: UserDoc;
    requestMetadata: IRequestMetadata;
    fingerprint: string;
  }) {
    const { id, email } = user;

    const refreshTokenJti = randomUUID();

    const session = await this.sessionService.generateSession({
      refreshTokenJti,
      fingerprint,
      userId: id,
      requestMetadata,
    });

    const { accessTokenCookie, accessToken } =
      this.helperTokenService.generateCookieWithJwtAccessToken({
        userId: id,
        email,
        sessionId: session.id,
      });

    const { refreshTokenCookie, refreshToken } =
      this.helperTokenService.generateCookieWithJwtRefreshToken(
        {
          userId: id,
          email,
          sessionId: session.id,
        },
        refreshTokenJti,
      );

    const verificationToken = this.helperTokenService.generateVerificationToken({
      userId: id,
      email,
      sessionId: session.id,
    });

    const fingerprintCookie = this.helperTokenService.generateCookieWithFingerprint(fingerprint);

    await this.userService.resetFailedLoginAttempts({ id, ip: requestMetadata.ip });

    return {
      verificationToken,
      accessToken,
      refreshToken,
      accessTokenCookie,
      refreshTokenCookie,
      fingerprintCookie,
    };
  }

  public async getAuthenticatedUser({
    email,
    plainTextPassword,
    ip,
  }: {
    email: string;
    plainTextPassword: string;
    ip: string | undefined;
  }) {
    const user = await this.userService.getByEmail(email);

    if (!user) throw new AppRequestException(ERROR_CODES.USER_NOT_FOUND);

    const isValidPassword = await this.verifyPassword({
      passwordString: plainTextPassword,
      passwordHashed: user.password ?? '',
    });

    if (isValidPassword) return user;

    await this.handleFailedPasswordValidation({ user, ip });

    throw new AppRequestException(ERROR_CODES.WRONG_CREDENTIALS);
  }

  public async verifyPassword({
    passwordString,
    passwordHashed,
  }: {
    passwordString: string;
    passwordHashed: string;
  }) {
    return this.helperTokenService.compare(passwordString, passwordHashed);
  }

  public async checkSessionWithRefreshToken({
    refreshToken,
  }: {
    refreshToken: string;
  }): Promise<{ payload: IJwt<ITokenPayload>; user: IUserWithSession }> {
    const { payload, isExpired } = this.helperTokenService.validateRefreshToken(refreshToken);

    if (payload.type !== this.appConfigService.jwtConfig.refreshToken.key) {
      throw new AppRequestException(ERROR_CODES.REFRESH_TOKEN_NOT_PROVIDED);
    }

    if (isExpired) {
      throw new AppRequestException(ERROR_CODES.REFRESH_TOKEN_EXPIRED);
    }

    const refreshTokenJti = payload.jti;

    const user = await this.userService.getUserWithSession(payload);

    if (!user) {
      throw new AppRequestException(ERROR_CODES.AUTH_USER_NOT_FOUND);
    }

    if (!user.session) {
      throw new AppRequestException(ERROR_CODES.AUTH_SESSION_NOT_FOUND);
    }

    if (user.session?.refreshTokenJti !== refreshTokenJti) {
      throw new AppRequestException(ERROR_CODES.REFRESH_TOKEN_INVALID);
    }

    // TODO: Check if the session has no been expired
    // if (user.session?.expiresAt && user.session?.expiresAt > Date.now()) {
    //   throw new AppRequestException(ERROR_CODES.REFRESH_TOKEN_INVALID);
    // }

    return { payload, user };
  }

  public async checkSessionWithAccessToken({ accessToken }: { accessToken: string }): Promise<{
    payload: IJwt<ITokenPayload>;
    user: IUserWithSession;
    isExpired: boolean | null;
  }> {
    const { payload, isExpired } = this.helperTokenService.validateAccessToken(accessToken);

    const user = await this.userService.getUserWithSession(payload);

    if (!user) {
      throw new AppRequestException(ERROR_CODES.AUTH_USER_NOT_FOUND);
    }

    if (!user.session) {
      throw new AppRequestException(ERROR_CODES.AUTH_SESSION_NOT_FOUND);
    }

    // TODO: Check if the session has no been expired
    // if (user.session?.expiresAt && user.session?.expiresAt > Date.now()) {
    //   throw new AppRequestException(ERROR_CODES.REFRESH_TOKEN_INVALID);
    // }

    return { payload, user, isExpired };
  }

  async signOut({ sessionId }: { sessionId: string }) {
    await this.sessionService.disableSession({ sessionId });
    const cookies = this.helperTokenService.getCookiesForLogOut();

    return cookies;
  }

  private async handleFailedPasswordValidation({
    user,
    ip,
  }: {
    user: UserEntity;
    ip: string | undefined;
  }): Promise<void> {
    if ((user.loginAttemptCount ?? 0) > 10)
      throw new AppRequestException(ERROR_CODES.LOGIN_TO_MANY_ATTEMPTS);

    await this.userService.incrementFailedPasswordValidation({ user, ip });
  }

  public checkForFailedLoginAttempts(user: UserEntity) {
    if (
      user.loginAttemptDate &&
      (user.loginAttemptCount ?? 0) > 10 &&
      this.differenceInMinutes(new Date(Date.now()), user.loginAttemptDate) < 10
    ) {
      throw new AppRequestException(ERROR_CODES.LOGIN_TO_MANY_ATTEMPTS);
    }
  }

  private differenceInMinutes(date1: Date, date2: Date): number {
    return this.helperDateService.diff(date1, date2, { format: ENUM_HELPER_DATE_DIFF.MINUTES });
  }

  // async generateRefreshToken({
  //   payloadData,
  //   requestMetadata,
  //   refreshTokenJti,
  //   fingerprint,
  // }: {
  //   payloadData: ITokenPayload;
  //   requestMetadata: IRequestMetadata;
  //   refreshTokenJti: string;
  //   fingerprint: string;
  // }) {
  //   const { userId, email } = payloadData;
  //   const session = await this.sessionService.generateSession({
  //     refreshTokenJti,
  //     userId,
  //     requestMetadata,
  //     fingerprint,
  //   });

  //   const newPayloadData: ITokenPayload = {
  //     userId,
  //     email,
  //     sessionId: session.id,
  //   };

  //   const { accessToken, accessTokenCookie } =
  //     this.helperTokenService.generateCookieWithJwtAccessToken(newPayloadData);

  //   const jti = randomUUID();

  //   const { refreshToken, refreshTokenCookie } =
  //     this.helperTokenService.generateCookieWithJwtRefreshToken(newPayloadData, jti);

  //   const fingerprintCookie = this.helperTokenService.generateCookieWithFingerprint(fingerprint);

  //   return {
  //     accessTokenCookie,
  //     refreshTokenCookie,
  //     fingerprintCookie,
  //     accessToken,
  //     refreshToken,
  //   };
  // }
}
