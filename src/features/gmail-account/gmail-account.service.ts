import { Injectable } from '@nestjs/common';

import { Credentials, OAuth2Client } from 'google-auth-library';
import { Types } from 'mongoose';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { AuthCallbackQueryDto } from '@/common/google/oauth2/dto/google-auth.dto';
import { PaginationService } from '@/common/pagination/services/pagination.service';
import { UserService } from '@/common/user/user.service';

import { CreateGmailAccountDto } from './dtos/create-gmail-account.dto';
import { GmailService } from './gmail.service';
import { IGoogleTokenInterface } from './interfaces';
import { GmailAccountDoc, GmailAccountEntity } from './repository/entities/gmail-account.entity';
import { GmailThreadEntity } from './repository/entities/gmail-thread.entity';
import { GmailAccountModel } from './repository/models/gmail-account.model';
import { GmailThreadModel } from './repository/models/gmail-thread.model';

@Injectable()
export class GmailAccountService {
  constructor(
    private gmailAccountModel: GmailAccountModel,
    private gmailThreadModel: GmailThreadModel,
    private userService: UserService,
    private paginationService: PaginationService,
    private gmailService: GmailService,
    private appConfigService: AppConfigService,
  ) {}

  async getEmailsByThread({ threadId, accountId }: { threadId: string; accountId: string }) {
    return this.gmailThreadModel.findAll({
      threadId,
      accountId: new Types.ObjectId(accountId),
    });
  }

  async getEmailById({ emailId, accountId }: { emailId: string; accountId: string }) {
    return this.gmailThreadModel.findOne({
      _id: new Types.ObjectId(emailId),
      accountId: new Types.ObjectId(accountId),
    });
  }

  async getAccountById(accountId: string) {
    return this.gmailAccountModel.findOne({
      _id: new Types.ObjectId(accountId),
    });
  }

  async getEmailsByAccount({
    accountId,
    page,
    limit,
    pageToken,
  }: {
    accountId: string;
    page: number;
    limit: number;
    pageToken?: string;
  }) {
    try {
      await this.prepareOAuthClient(accountId);

      const emailsResponse =
        page === 1
          ? await this.gmailService.syncLatestThreads({ accountId, pageToken, limit })
          : await this.gmailService.syncOlderThreads({ accountId, pageToken, limit });

      await this.createEmails(emailsResponse.emails);
      const data = await this.getThreadsByAccountAndPage(accountId, page, limit);

      const totalPage = this.paginationService.totalPageWithoutMax(data.total, limit);

      return {
        results: data.results,
        total: data.total,
        totalPage,
        nexPageToken: emailsResponse.nextPageToken,
      };
    } catch (error) {
      throw new AppRequestException({
        ...ERROR_CODES.GMAIL_GET_MAILS_BY_ACCOUNT_ERROR,
        errors: [error],
      });
    }
  }

  async getToken(accountId: string): Promise<Credentials | null> {
    const account = await this.gmailAccountModel.findOneById(accountId);

    if (account) {
      return {
        access_token: account.accessToken,
        refresh_token: account.refreshToken,
        scope: account.scope ?? '',
        expiry_date: account.expiryDate ?? 0,
        token_type: account.tokenType ?? '',
      };
    }

    return null;
  }

  async getThreadsByAccountAndPage(accountId: string, page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;

    return await this.gmailThreadModel.findThreadsByAccountAndPage<GmailThreadEntity>({
      accountId,
      limit: pageSize,
      offset,
    });
  }

  async gmailAccountCallback(query: AuthCallbackQueryDto) {
    const oAuth2Client = this.gmailService.getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(query.code);
    const userId = query.state;

    const profile = await this.gmailService.getGoogleProfile(tokens?.access_token ?? '');

    const newEmailAccount: CreateGmailAccountDto = {
      accessToken: tokens.access_token as string, // I want a database error validation
      refreshToken: tokens.refresh_token as string, // I want a database error validation
      provider: 'google',
      fullName: profile.name ?? '',
      scope: tokens.scope,
      expiryDate: tokens.expiry_date,
      email: profile.email ?? '',
      userId: new Types.ObjectId(userId),
      tokenType: tokens.token_type,
      avatar: profile.picture ?? '',
    };

    const user = await this.userService.getById(userId);
    await this.createGmailAccount(newEmailAccount);
    await this.userService.sendWelcomeEmail(user);
  }

  public async createGmailAccount(accountData: CreateGmailAccountDto) {
    return await this.gmailAccountModel.create(accountData);
  }

  public async getAccountsByUser(userId: string): Promise<Array<Partial<GmailAccountEntity>>> {
    const accounts = await this.gmailAccountModel.findAll({
      userId: new Types.ObjectId(userId),
    });

    return accounts.map((account) => this.sanitizeAccount(account));
  }

  public async getEmailSuggestions({ accountId }: { accountId: string }): Promise<string[]> {
    return this.gmailThreadModel.getEmailSuggestions(accountId);
  }

  public async validateAccount({ userId, accountId }: { userId: string; accountId: string }) {
    const account = await this.gmailAccountModel.findOneById(accountId);

    if (!account) throw new AppRequestException(ERROR_CODES.GMAIL_ACCOUNT_NOT_FOUND);

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return userId === account.userId.toString();
  }

  public sanitizeAccount({
    id,
    provider,
    email,
    fullName,
  }: GmailAccountDoc): Partial<GmailAccountDoc> {
    return {
      id,
      provider,
      email,
      fullName,
    };
  }

  async createEmails(threadDetails: GmailThreadEntity[]): Promise<void> {
    await this.gmailThreadModel.createMany(threadDetails);
  }

  async updateTokenInDB(id: string, updatedToken: IGoogleTokenInterface): Promise<void> {
    const user = await this.gmailAccountModel.findOne({ _id: new Types.ObjectId(id) });
    if (user) {
      await this.gmailAccountModel.updateOne({ _id: new Types.ObjectId(id) }, updatedToken);
    }
  }

  async validToken(accountId: string): Promise<Credentials> {
    const token = await this.getToken(accountId);

    if (!token) throw new Error('token not provided');

    if (!this.isTokenExpired(token.expiry_date as number)) return token;

    try {
      const credentials = await this.refreshToken(token);

      await this.updateTokenInDB(accountId, {
        accessToken: credentials.access_token ?? '',
        refreshToken: credentials.refresh_token ?? '',
        expiryDate: credentials.expiry_date ?? 0,
        tokenType: credentials.token_type ?? '',
        scope: credentials.scope ?? '',
      });

      return credentials;
    } catch (error) {
      throw new AppRequestException({
        ...ERROR_CODES.GMAIL_REFRESH_TOKEN_ERROR,
        errors: [error],
      });
    }
  }

  private isTokenExpired(tokenExpiryDate: number): boolean {
    return tokenExpiryDate <= Date.now();
  }

  async refreshToken(token: Credentials): Promise<Credentials> {
    try {
      const oAuth2Client = this.gmailService.getOAuth2Client();

      oAuth2Client.setCredentials({ refresh_token: token.refresh_token });

      const { credentials } = await oAuth2Client.refreshAccessToken();

      return credentials;
    } catch (error) {
      throw new AppRequestException({
        ...ERROR_CODES.GMAIL_REFRESH_TOKEN_ERROR,
        errors: [error],
      });
    }
  }

  async prepareOAuthClient(accountId: string): Promise<OAuth2Client> {
    const oAuth2Client = this.gmailService.getOAuth2Client();
    const token = await this.validToken(accountId);

    if (!token) {
      throw new AppRequestException(ERROR_CODES.GMAIL_REFRESH_TOKEN_NOT_FOUND);
    }

    oAuth2Client.setCredentials(token);

    return oAuth2Client;
  }

  async generateOAuth2Url(userId: string): Promise<string> {
    const { gmailAccountAccessType, gmailAccountScope } = this.appConfigService.googleConfig;
    const oAuth2Client = this.gmailService.getOAuth2Client();
    try {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: gmailAccountAccessType,
        scope: gmailAccountScope,
        state: userId,
      });
      return authUrl;
    } catch (error) {
      throw new AppRequestException({
        ...ERROR_CODES.GMAIL_OAUTH_URL_ERROR,
        errors: [error],
      });
    }
  }
}
