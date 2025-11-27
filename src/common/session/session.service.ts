import { Injectable } from '@nestjs/common';

import { Types } from 'mongoose';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { IRequestMetadata } from '@/common/request/interfaces/request-metadata.interface';
import { SessionDoc } from '@/common/session/repository/entities/session.entity';
import { SessionModel } from '@/common/session/repository/models/session.model';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionModel: SessionModel,
    private readonly appConfigService: AppConfigService,
  ) {}

  private getSessionExpiry() {
    const { refreshToken } = this.appConfigService.jwtConfig;

    return new Date(Date.now() + refreshToken.expirationTime);
  }

  public async generateSession({
    refreshTokenJti,
    userId,
    requestMetadata: { ip, userAgent },
    fingerprint,
  }: {
    refreshTokenJti: string;
    userId: string;
    requestMetadata: IRequestMetadata;
    fingerprint: string;
  }) {
    const expiresAt = this.getSessionExpiry();

    return await this.sessionModel.updateOne(
      { fingerprint, userId: new Types.ObjectId(userId) },
      {
        refreshTokenJti,
        fingerprint,
        userAgent: userAgent.ua,
        ipAddress: ip,
        expiresAt,
        isActive: true,
      },
      {
        upsert: true,
      },
    );
  }

  async disableSession({ sessionId }: { sessionId: string }): Promise<boolean> {
    await this.sessionModel.updateOne(
      { _id: new Types.ObjectId(sessionId) },
      {
        isActive: false,
        expiresAt: null,
      },
    );

    return true;
  }

  async disableAllUserSessions(userId: string): Promise<boolean> {
    try {
      return await this.sessionModel.updateMany(
        { userId: new Types.ObjectId(userId) },
        {
          isActive: false,
          expiresAt: null,
        },
      );
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  async getActiveSessions(userId: string): Promise<SessionDoc[]> {
    return await this.sessionModel.findAll({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });
  }
}
