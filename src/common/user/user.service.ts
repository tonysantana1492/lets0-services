import { Injectable } from '@nestjs/common';

import { Types } from 'mongoose';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { IUserWithSession } from '@/common/auth/interfaces/user-with-session.interface';
import ContextService from '@/common/context/context.service';
import { IJwt } from '@/common/helpers/interfaces/helper.encryption-service.interface';
import { TestEmailBodyDto } from '@/common/user/dto/test-email.dto';
import { EMAIL_TEMPLATE } from '@/common/user/enum/email-template.enum';
import { IpAddressService } from '@/common/user/ip-address.service';

import { AccountCreatePasswordDto } from '../auth/dto/account-create-password.dto';
import { AccountVerifyDto } from '../auth/dto/account-verify.dto';
import { EmailService } from '../email/email.service';
import { ERROR_CODES } from '../error/constants/error-code';
import {
  AppRequestException,
  CUSTOM_HTTP_EXCEPTION_NAME,
} from '../error/exceptions/app-request.exception';
import { HelperTokenService } from '../helpers/services/helper.token.service';
import { LanguageService } from '../language/services/language.service';
import { AccountForgotPasswordDto } from './dto/account-forgot-password.dto';
import { AccountResetPasswordDto } from './dto/account-reset-password.dto';
import { ICreateUser } from './interfaces/create-user.interface';
import { UserDoc, UserEntity } from './repository/entities/user.entity';
import { UserModel } from './repository/models/user.model';

@Injectable()
export class UserService {
  private readonly footerWelcome: string;

  private readonly footerQuestions: string;

  private readonly contactEmail: string;

  private readonly footerEmailLink: string;

  private readonly emailFrom: string;

  private readonly clientUrl: string;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly emailService: EmailService,
    private readonly languageService: LanguageService,
    private readonly helperTokenService: HelperTokenService,
    private readonly userModel: UserModel,
    private readonly contextService: ContextService,
    private readonly ipAddressService: IpAddressService,
  ) {
    this.footerWelcome = this.languageService.get('email.common.footerWelcome');
    this.footerQuestions = this.languageService.get('email.common.footerQuestions');
    this.contactEmail = this.languageService.get('email.common.contactEmail');
    this.footerEmailLink = this.languageService.get('email.common.footerEmailLink');

    const { from } = this.appConfigService.emailConfig;
    const { client } = this.appConfigService.appConfig;

    this.emailFrom = from;
    this.clientUrl = client.url;
  }

  private async updatePassword({
    id,
    hashedPassword,
  }: {
    id: string;
    hashedPassword: string;
  }): Promise<boolean> {
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(id) },
      {
        emailVerified: true,
        password: hashedPassword,
      },
    );

    return true;
  }

  public async createUser(userData: ICreateUser) {
    try {
      return await this.userModel.create(userData);
    } catch (error) {
      if (error?.responseCode === ERROR_CODES.DUPLICATE_KEY.responseCode) {
        throw new AppRequestException({ ...ERROR_CODES.EMAIL_ALREADY_EXISTS, errors: [error] });
      }

      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  async updateOneAndReturn(id: string, data: Partial<UserEntity>) {
    return this.userModel.updateOne({ _id: new Types.ObjectId(id) }, data);
  }

  public async getAllUsers(): Promise<UserDoc[]> {
    return await this.userModel.findAll();
  }

  async countActiveUsers(workspaceId: string): Promise<number> {
    return this.userModel.getTotal({
      workspaceId: new Types.ObjectId(workspaceId),
      isActive: true,
    });
  }

  public async getUserWithSession({ data }: IJwt): Promise<IUserWithSession> {
    return await this.userModel.getUserWithSession(data);
  }

  public async getById(id: string): Promise<UserDoc> {
    return await this.userModel.findOneById(id);
  }

  public async getByEmail(email: string): Promise<UserDoc> {
    return await this.userModel.findOne({ email });
  }

  public async resetFailedLoginAttempts({
    id,
    ip,
  }: {
    id: string;
    ip: string | undefined;
  }): Promise<boolean> {
    await this.userModel.updateOne(
      {
        _id: new Types.ObjectId(id),
      },
      {
        loginAttemptCount: 0,
        loginAttemptIp: null,
        loginAttemptDate: null,
        lastLoginDate: new Date(),
        lastLoginIp: ip,
      },
    );
    return true;
  }

  public async incrementFailedPasswordValidation({
    user,
    ip,
  }: {
    user: UserEntity;
    ip: string | undefined;
  }): Promise<boolean> {
    await this.userModel.updateOne(
      { email: user.email },
      {
        loginAttemptIp: ip,
        loginAttemptCount: (user.loginAttemptCount ?? 0) + 1,
        loginAttemptDate: new Date(Date.now()),
      },
    );

    return true;
  }

  public async createInitialPassword(accountCreatePasswordDto: AccountCreatePasswordDto) {
    const { token, password } = accountCreatePasswordDto;
    const accountVerifyDto = { token };

    const user = await this.validateVerificationTokenNotVerifiedAccount(accountVerifyDto);

    const hashedPassword = this.helperTokenService.hash(password);

    await this.updatePassword({ id: user.id, hashedPassword });

    await this.sendSignInEmail(user);
  }

  //! Forgot Password
  public async forgotPassword(accountForgotPasswordDto: AccountForgotPasswordDto): Promise<string> {
    const user = await this.getByEmail(accountForgotPasswordDto.email);

    if (!user) throw new AppRequestException(ERROR_CODES.USER_NOT_FOUND);

    await this.sendForgotPasswordLinkEmail(user);

    return this.helperTokenService.generateAccessToken({
      email: user.email,
      userId: user.id,
      sessionId: '',
    });
  }

  async resetForgotPassword({ token, password }: AccountResetPasswordDto): Promise<void> {
    const user = await this.validateForgotPasswordToken({ token });

    const hashedPassword = this.helperTokenService.hash(password);
    await this.updatePassword({ id: user.id, hashedPassword });
  }

  //! Sanitize user
  public sanitizeUser(user: UserDoc | UserEntity): Partial<UserEntity> {
    const { email, firstName, lastName, roles, avatar, mfaConfig } = user;

    return {
      email,
      firstName,
      lastName,
      roles,
      avatar,
      mfaConfig: {
        isEnable: mfaConfig?.isEnable,
      },
    };
  }

  //! Send emails
  public async sedTestEmail({
    testEmailBodyDto,
    user,
  }: {
    testEmailBodyDto: TestEmailBodyDto;
    user: UserDoc;
  }) {
    if (testEmailBodyDto.type === EMAIL_TEMPLATE.FORGOT_PASSWORD_EMAIL) {
      return this.sendForgotPasswordLinkEmail(user);
    }

    if (testEmailBodyDto.type === EMAIL_TEMPLATE.OTP_EMAIL) {
      return this.sendOtpCodeEmail({ code: '123456', user });
    }

    if (testEmailBodyDto.type === EMAIL_TEMPLATE.VERIFY_ACCOUNT_EMAIL) {
      return this.sendVerificationLinkMail(user);
    }

    if (testEmailBodyDto.type === EMAIL_TEMPLATE.WELCOME_EMAIL) {
      return this.sendWelcomeEmail(user);
    }
  }

  public async sendVerificationLinkMail(user: UserDoc): Promise<void> {
    const { firstName, lastName, email, id } = user;

    const token = this.helperTokenService.generateVerificationToken({
      email,
      userId: id,
      sessionId: '',
    });
    const link = `${this.clientUrl}/create-password?token=${encodeURIComponent(token)}`;

    const subject = "Action Required: Confirm Your Email to Join Let's 0";

    const footerContext = await this.getFooterContext();

    const options = {
      from: this.emailFrom,
      to: email,
      replyTo: this.emailFrom,
      subject,
      template: EMAIL_TEMPLATE.VERIFY_ACCOUNT_EMAIL,
      context: {
        subject,
        userName: `${firstName} ${lastName}`,
        link,
        ...footerContext,
      },
    };

    return this.emailService.sendMail(options);
  }

  public async sendSignInEmail({ email, firstName, lastName }: Partial<UserDoc>): Promise<void> {
    const link = `${this.clientUrl}/sign-in`;

    const subject = "Welcome! Access to Let's 0 Platform Now";

    const footerContext = await this.getFooterContext();

    const options = {
      from: this.emailFrom,
      to: email,
      replyTo: this.emailFrom,
      subject,
      template: EMAIL_TEMPLATE.SIGN_IN_EMAIL,
      context: {
        subject,
        userName: `${firstName} ${lastName}`,
        link,
        ...footerContext,
      },
    };

    return this.emailService.sendMail(options);
  }

  public async sendWelcomeEmail({ email, firstName, lastName }: Partial<UserDoc>): Promise<void> {
    const subject = "Welcome to Let's 0! Your Journey Begins Here";
    const link = `${this.clientUrl}`;

    const footerContext = await this.getFooterContext();

    const options = {
      from: this.emailFrom,
      to: email,
      replyTo: this.emailFrom,
      subject,
      template: EMAIL_TEMPLATE.WELCOME_EMAIL,
      context: {
        subject,
        userName: `${firstName} ${lastName}`,
        link,
        ...footerContext,
      },
    };

    return this.emailService.sendMail(options);
  }

  public async sendForgotPasswordLinkEmail({
    id,
    email,
    firstName,
    lastName,
  }: UserDoc): Promise<void> {
    const token = this.helperTokenService.generateForgotPasswordToken({
      userId: id,
      email,
      sessionId: '',
    });

    const link = `${this.clientUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const subject = 'Action Required: Reset Your Password';

    const footerContext = await this.getFooterContext();

    const options = {
      from: this.emailFrom,
      to: email,
      replyTo: this.emailFrom,
      subject,
      template: EMAIL_TEMPLATE.FORGOT_PASSWORD_EMAIL,
      context: {
        subject,
        userName: `${firstName} ${lastName}`,
        link,
        ...footerContext,
      },
    };

    return this.emailService.sendMail(options);
  }

  public async sendOtpCodeEmail({ code, user }: { code: string; user: UserDoc }): Promise<void> {
    const { email, firstName, lastName } = user;
    const { mfaOtpToken } = this.appConfigService.jwtConfig;
    const { appName } = this.appConfigService.appConfig;

    const subject = `${this.languageService.get('dictionary.verificationCode')} - ${appName}`;
    const footerContext = await this.getFooterContext();

    const options = {
      from: this.emailFrom,
      to: email,
      replyTo: this.emailFrom,
      subject,
      template: EMAIL_TEMPLATE.OTP_EMAIL,

      context: {
        subject,
        userName: `${firstName} ${lastName}`,
        otpCode: code,
        expirationTime: `${mfaOtpToken.expirationTime / 60} ${this.languageService.get('dictionary.minutes')}`,
        ...footerContext,
      },
    };

    return this.emailService.sendMail(options);
  }

  private async getFooterContext() {
    const { ip } = this.contextService.getRequestMetadata();
    const { appName, client, supportEmail, appAddress } = this.appConfigService.appConfig;
    const { city, country, region } = await this.ipAddressService.getLocationByIp(ip ?? '');

    return {
      supportEmail,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }),
      location: `${city}, ${region}, ${country}`,
      ipAddress: ip || this.languageService.get('dictionary.unknownIp'),
      currentYear: new Date().getFullYear(),
      supportUrl: client.supportUrl,
      privacyPolicyUrl: client.privacyPolicyUrl,
      termsUrl: client.termsOfServiceUrl,
      appName,
      appAddress,
      // unsubscribeUrl: 'https://lets0.com/unsubscribe?token=abc123',
    };
  }

  //! Validations
  public validateNotVerifiedUser(user: Partial<UserEntity> | null): boolean {
    if (!user) throw new AppRequestException(ERROR_CODES.USER_NOT_FOUND);

    if (!user.isActive) throw new AppRequestException(ERROR_CODES.USER_INACTIVE);

    if (user.emailVerified === false) return true;

    throw new AppRequestException(ERROR_CODES.USER_ALREADY_VERIFIED);
  }

  public validateVerifiedUser(user: Partial<UserEntity> | null): boolean {
    if (!user) throw new AppRequestException(ERROR_CODES.USER_NOT_FOUND);

    if (!user.isActive) throw new AppRequestException(ERROR_CODES.USER_INACTIVE);

    if (user.emailVerified === true) return true;

    throw new AppRequestException(ERROR_CODES.USER_NOT_VERIFIED);
  }

  public async validateAccessTokenVerifiedAccount(
    accountVerifyDto: AccountVerifyDto,
  ): Promise<UserDoc> {
    const { token } = accountVerifyDto;
    try {
      const { payload, isExpired, hasError } = this.helperTokenService.validateAccessToken(token);
      if (hasError || !payload) throw new AppRequestException(ERROR_CODES.ACCESS_TOKEN_INVALID);

      const user = await this.getById(payload.data.userId);

      this.validateVerifiedUser(user);

      if (isExpired) {
        await this.sendVerificationLinkMail(user);

        throw new AppRequestException(ERROR_CODES.ACCESS_TOKEN_EXPIRED);
      }

      return user;
    } catch (error) {
      if (error.name === CUSTOM_HTTP_EXCEPTION_NAME) throw error;
      throw new AppRequestException({
        ...ERROR_CODES.ACCESS_TOKEN_INTERNAL_ERROR,
        errors: [error],
      });
    }
  }

  public async validateAccessTokenNotVerifiedAccount(
    accountVerifyDto: AccountVerifyDto,
  ): Promise<UserDoc> {
    const { token } = accountVerifyDto;

    try {
      const { payload, isExpired, hasError } = this.helperTokenService.validateAccessToken(token);
      if (hasError || !payload) throw new AppRequestException(ERROR_CODES.ACCESS_TOKEN_INVALID);

      const user = await this.getById(payload.data.userId);

      this.validateNotVerifiedUser(user);

      if (isExpired) {
        await this.sendVerificationLinkMail(user);

        throw new AppRequestException(ERROR_CODES.ACCESS_TOKEN_EXPIRED);
      }

      return user;
    } catch (error) {
      if (error.name === CUSTOM_HTTP_EXCEPTION_NAME) throw error;
      throw new AppRequestException({
        ...ERROR_CODES.ACCESS_TOKEN_INTERNAL_ERROR,
        errors: [error],
      });
    }
  }

  public async validateVerificationToken(accountVerifyDto: AccountVerifyDto): Promise<UserDoc> {
    const { token } = accountVerifyDto;

    try {
      const { payload, isExpired, hasError } =
        this.helperTokenService.validateVerificationToken(token);
      if (hasError || !payload)
        throw new AppRequestException(ERROR_CODES.VERIFICATION_TOKEN_INVALID);

      const user = await this.getById(payload.data.userId);

      this.validateVerifiedUser(user);

      if (isExpired) {
        await this.sendVerificationLinkMail(user);

        throw new AppRequestException(ERROR_CODES.VERIFICATION_TOKEN_EXPIRED);
      }

      return user;
    } catch (error) {
      if (error.name === CUSTOM_HTTP_EXCEPTION_NAME) throw error;
      throw new AppRequestException({
        ...ERROR_CODES.VERIFICATION_TOKEN_INTERNAL_ERROR,
        errors: [error],
      });
    }
  }

  public async validateVerificationTokenNotVerifiedAccount(
    accountVerifyDto: AccountVerifyDto,
  ): Promise<UserDoc> {
    const { token } = accountVerifyDto;

    try {
      const { payload, isExpired, hasError } =
        this.helperTokenService.validateVerificationToken(token);
      if (hasError || !payload)
        throw new AppRequestException(ERROR_CODES.VERIFICATION_TOKEN_INVALID);

      const user = await this.getById(payload.data.userId);

      this.validateNotVerifiedUser(user);

      if (isExpired) {
        await this.sendVerificationLinkMail(user);

        throw new AppRequestException(ERROR_CODES.VERIFICATION_TOKEN_EXPIRED);
      }

      return user;
    } catch (error) {
      if (error.name === CUSTOM_HTTP_EXCEPTION_NAME) throw error;
      throw new AppRequestException({
        ...ERROR_CODES.VERIFICATION_TOKEN_INTERNAL_ERROR,
        errors: [error],
      });
    }
  }

  public async validateForgotPasswordToken({ token }: AccountVerifyDto): Promise<UserDoc> {
    try {
      const { payload, isExpired, hasError } =
        this.helperTokenService.validateForgotPasswordToken(token);

      if (hasError || !payload)
        throw new AppRequestException(ERROR_CODES.FORGOT_PASSWORD_TOKEN_INVALID);

      const user = await this.getById(payload.data.userId);

      this.validateVerifiedUser(user);

      if (isExpired) {
        await this.sendForgotPasswordLinkEmail(user);

        throw new AppRequestException(ERROR_CODES.FORGOT_PASSWORD_TOKEN_EXPIRED);
      }

      return user;
    } catch (error) {
      if (error.name === CUSTOM_HTTP_EXCEPTION_NAME) throw error;
      throw new AppRequestException({
        ...ERROR_CODES.FORGOT_PASSWORD_TOKEN_INTERNAL_ERROR,
        errors: [error],
      });
    }
  }
}
