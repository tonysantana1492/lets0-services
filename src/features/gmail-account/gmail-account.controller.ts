import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { Protected } from '@/common/auth/decorators/protected.decorator';
import { Public } from '@/common/auth/decorators/public.decorator';
import { IRequestWithUser } from '@/common/auth/interfaces/request-with-user.interface';
import { DocRequest } from '@/common/doc/decorators/doc.decorator';
import { AuthCallbackQueryDto } from '@/common/google/oauth2/dto/google-auth.dto';
import { PaginationQuery } from '@/common/pagination/decorators/pagination.decorator';
import { ResponseHttp, ResponseHttpPaging } from '@/common/response/decorators/response.decorator';
import { IResponseDefault, IResponsePaging } from '@/common/response/interfaces/response.interface';

import {
  PAGINATION_EMAIL_ORDER_BY_AVAILABLE,
  PAGINATION_EMAIL_SEARCH_AVAILABLE,
} from './constants/query.constants';
import { GetEmailsPaginationDto } from './dtos/get-emails-pagination..dto';
import { ValidateAccountIdDto } from './dtos/validate-gmail-account-id.dto';
import { GmailAccountService } from './gmail-account.service';
import { ValidateAccount } from './guards/validate-account.guard';
import { GmailAccountDoc, GmailAccountEntity } from './repository/entities/gmail-account.entity';

@Controller('gmail')
@ApiTags('gmail')
export class GmailAccountController {
  constructor(
    private readonly gmailAccountService: GmailAccountService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @Protected()
  @ResponseHttp()
  @Get('generate-oauth2-url')
  async generateOAuth2Url(@Req() { user }: IRequestWithUser) {
    const url = await this.gmailAccountService.generateOAuth2Url(user.id);

    return {
      data: {
        url,
      },
    };
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ queries: AuthCallbackQueryDto })
  @Get('callback')
  async gmailAccountCallback(@Query() query: AuthCallbackQueryDto, @Res() res: IResponseDefault) {
    await this.gmailAccountService.gmailAccountCallback(query);
    const { client } = this.appConfigService.appConfig;

    res.redirect(`${client.url}`);
  }

  @Protected()
  @ResponseHttp()
  @Get('accounts')
  async getAccountsByUser(
    @Req() { user }: IRequestWithUser,
  ): Promise<{ data: { accounts: Array<Partial<GmailAccountEntity>> } }> {
    const accounts = await this.gmailAccountService.getAccountsByUser(user.id);

    return {
      data: {
        accounts,
      },
    };
  }

  @Protected()
  @UseGuards(ValidateAccount)
  @DocRequest({ params: ValidateAccountIdDto })
  @ResponseHttp()
  @Get('accounts/:accountId')
  async getAccountById(
    @Param() { accountId }: ValidateAccountIdDto,
  ): Promise<{ data: { account: Partial<GmailAccountDoc> } }> {
    const account = await this.gmailAccountService.getAccountById(accountId);

    return {
      data: {
        account,
      },
    };
  }

  @Protected()
  @UseGuards(ValidateAccount)
  @ResponseHttpPaging()
  @DocRequest({ params: ValidateAccountIdDto })
  @Get('accounts/:accountId/emails')
  async getMailsByAccount(
    @PaginationQuery({
      availableSearch: PAGINATION_EMAIL_SEARCH_AVAILABLE,
      availableOrderBy: PAGINATION_EMAIL_ORDER_BY_AVAILABLE,
    })
    { _page, _limit, pageToken }: GetEmailsPaginationDto,

    @Param() { accountId }: ValidateAccountIdDto,
  ): Promise<IResponsePaging> {
    const { results, total, totalPage, nexPageToken } =
      await this.gmailAccountService.getEmailsByAccount({
        accountId,
        page: _page,
        limit: _limit,
        pageToken: pageToken === 'undefined' ? undefined : pageToken,
      });

    return {
      _pagination: { total, totalPage },
      data: {
        nexPageToken,
        emails: results,
      },
    };
  }

  @Protected()
  @UseGuards(ValidateAccount)
  @DocRequest({ params: ValidateAccountIdDto })
  @ResponseHttp()
  @Get('accounts/:accountId/emails/search')
  async getSearchMailsByAccount(@Param() { accountId }: ValidateAccountIdDto) {
    const emails = await this.gmailAccountService.getEmailsByAccount({
      accountId,
      page: 1,
      limit: 10,
    });
    return {
      data: {
        emails,
      },
    };
  }

  @Protected()
  @UseGuards(ValidateAccount)
  @ResponseHttp()
  @Get('accounts/:accountId/threads/:threadId/emails')
  async getEmailsByThread(
    @Param('threadId') threadId: string,
    @Param('accountId') accountId: string,
  ) {
    const emails = await this.gmailAccountService.getEmailsByThread({ threadId, accountId });
    return {
      data: {
        emails,
      },
    };
  }

  @Protected()
  @UseGuards(ValidateAccount)
  @ResponseHttpPaging()
  @Get('accounts/:accountId/suggestions')
  async getEmailSuggestions(
    @PaginationQuery({
      availableSearch: ['from', 'to'],
      availableOrderBy: PAGINATION_EMAIL_ORDER_BY_AVAILABLE,
    })
    @Param('accountId')
    accountId: string,
  ) {
    const suggestions = await this.gmailAccountService.getEmailSuggestions({ accountId });
    return {
      _pagination: { total: suggestions.length, totalPage: null },
      data: {
        suggestions,
      },
    };
  }

  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() dto: UpdateGmailAccountDto) {
  //   return await this.gmailAccountService.update(id, dto);
  // }

  // @Get('trash/:account_id/:thread_id')
  // async moveToTrash(@Param('account_id') account_id: string, @Param('thread_id') thread_id: string) {
  //   return await this.gmailAccountService.moveToTrash(account_id, thread_id);
  // }

  // @Get('un-trash/:account_id/:thread_id')
  // async restoreFromTrash(@Param('account_id') account_id: string, @Param('thread_id') thread_id: string) {
  //   return await this.gmailAccountService.restoreFromTrash(account_id, thread_id);
  // }

  // @Get('read/:account_id/:thread_id')
  // async markEmailAsRead(@Param('account_id') account_id: string, @Param('thread_id') thread_id: string) {
  //   return await this.gmailAccountService.markEmailAsRead(account_id, thread_id);
  // }

  // @Get('un-read/:account_id/:thread_id')
  // async markEmailAsUnread(@Param('account_id') account_id: string, @Param('thread_id') thread_id: string) {
  //   return await this.gmailAccountService.markEmailAsUnread(account_id, thread_id);
  // }

  // @Post('download-attachment/:account_id')
  // async downloadAttachment(
  //   @Param('account_id') accountId: string,
  //   @Body() downloadAttachmentDto: DownloadAttachmentDto,
  //   @Res() response: Response,
  // ) {
  //   return this.gmailAccountService.downloadAttachment(accountId, downloadAttachmentDto, response);
  // }

  // @Post(':account_id')
  // @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  // async sendMail(
  //   @Param('account_id') account_id: string,
  //   @Body() sendEmailDto: SendEmailDto,
  //   @UploadedFiles() files: { files?: Express.Multer.File[] },
  //   @Res() response: Response,
  // ) {
  //   // Check the accumulative size of the files
  //   const totalSize = (files.files || []).reduce((sum, file) => sum + file.size, 0);
  //   if (totalSize > 25 * 1024 * 1024) {
  //     // 25 MB in bytes
  //     // throw new BadRequestException(customMessage(HttpStatus.BAD_REQUEST, MESSAGE.FILE_SIZE_EXCEPTION_MESSAGE));
  //   }
}
