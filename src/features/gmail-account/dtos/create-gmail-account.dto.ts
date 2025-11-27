import { PickType } from '@nestjs/swagger';

import { GmailAccountEntity } from '../repository/entities/gmail-account.entity';

export class CreateGmailAccountDto extends PickType(GmailAccountEntity, [
  'provider',
  'userId',
  'accessToken',
  'refreshToken',
  'fullName',
  'email',
  'scope',
  'expiryDate',
  'tokenType',
  'avatar',
] as const) {}
