import { Injectable } from '@nestjs/common';

import { OAuth2Client } from 'google-auth-library';
import { gmail_v1, google } from 'googleapis';
import { Types } from 'mongoose';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { ENUM_PAGINATION_SORT_DIRECTION_TYPE } from '@/common/pagination/constants/pagination.enum.constant';

import { IAttachmentsResponseInterface, IMessageInterface, IThreadListParams } from './interfaces';
import { GmailThreadEntity } from './repository/entities/gmail-thread.entity';
import { GmailThreadModel } from './repository/models/gmail-thread.model';

@Injectable()
export class GmailService {
  private oAuth2Client: OAuth2Client;

  constructor(
    private gmailThreadModel: GmailThreadModel,
    private appConfigService: AppConfigService,
  ) {
    const { gmailAccountClientId, gmailAccountClientSecret, gmailAccountCallbackUrl } =
      this.appConfigService.googleConfig;

    this.oAuth2Client = new google.auth.OAuth2(
      gmailAccountClientId,
      gmailAccountClientSecret,
      gmailAccountCallbackUrl,
    );
  }

  public getOAuth2Client(): OAuth2Client {
    return this.oAuth2Client;
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

  async syncLatestThreads({
    accountId,
    pageToken,
    limit,
  }: {
    accountId: string;
    pageToken: string | undefined;
    limit: number;
  }) {
    const latestThread = await this.getLatestThread();
    const lastThreadDate = latestThread?.date
      ? new Date(latestThread.date).getTime() / 1000
      : undefined;

    const common = await this.syncThreadsCommon({
      accountId,
      referenceDate: lastThreadDate,
      isLatest: true,
      pageToken,
      limit,
    });

    return common;
  }

  async syncOlderThreads({
    accountId,
    pageToken,
    limit,
  }: {
    accountId: string;
    pageToken: string | undefined;
    limit: number;
  }) {
    const oldestThread = await this.getOldestThread();
    const oldestThreadDate = oldestThread?.date
      ? new Date(oldestThread.date).getTime() / 1000
      : undefined;

    if (oldestThreadDate) {
      return this.syncThreadsCommon({
        accountId,
        referenceDate: oldestThreadDate,
        isLatest: false,
        pageToken,
        limit,
      });
    }

    return this.syncLatestThreads({
      accountId,
      pageToken,
      limit,
    });
  }

  async syncThreadsCommon({
    accountId,
    referenceDate,
    isLatest,
    pageToken,
    limit,
  }: {
    accountId: string;
    referenceDate: number | undefined;
    isLatest: boolean;
    pageToken: string | undefined;
    limit: number;
  }) {
    const data = await this.listThreadIds({
      pageToken,
      sinceDateTimestamp: referenceDate,
      isLatest,
      limit,
    });
    const threadIds = data.threads || [];

    const nextPageToken = data.nextPageToken;

    const emails = await this.fetchThreadDetails({
      threads: threadIds,
      accountId,
      sinceDateTimestamp: referenceDate,
      isLatest,
    });

    return {
      nextPageToken,
      emails,
    };
  }

  async listThreadIds({
    sinceDateTimestamp,
    isLatest,
    pageToken,
    limit,
  }: {
    sinceDateTimestamp?: number;
    isLatest?: boolean;
    pageToken: string | undefined;
    limit: number;
  }): Promise<gmail_v1.Schema$ListThreadsResponse> {
    const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
    const { gmailAccountPageSizeDefault } = this.appConfigService.googleConfig;

    const params: IThreadListParams = {
      userId: 'me',
      maxResults: limit ?? gmailAccountPageSizeDefault,
      pageToken,
      //   labelIds: ['INBOX'],
      //   q: 'is:unread',
    };

    if (sinceDateTimestamp) {
      params.q = isLatest ? `after:${sinceDateTimestamp}` : `before:${sinceDateTimestamp}`;
    }

    const response = await gmail.users.threads.list(params);

    return response.data;
  }

  async fetchThreadDetails({
    threads,
    accountId,
    sinceDateTimestamp,
    isLatest,
  }: {
    threads: gmail_v1.Schema$Thread[];
    accountId: string;
    sinceDateTimestamp: number | undefined;
    isLatest: boolean;
  }): Promise<GmailThreadEntity[]> {
    const threadDetails: GmailThreadEntity[] = [];

    const threadPromises = threads.map((thread) => this.getThreadDetails(thread.id as string));

    const threadDetailsResponses = await Promise.all(threadPromises);

    const allMessageIdsFromThreads = threadDetailsResponses.flatMap(
      (response) => response.messages?.map(({ id }) => id as string) ?? [],
    );

    const existingMessages = await this.gmailThreadModel.findAll({
      emailId: { $in: allMessageIdsFromThreads },
    });

    const existingMessagesIds = new Set(
      existingMessages.map((message) => message.emailId.toString()),
    );

    const processMessagesPromises = threadDetailsResponses.map(
      async ({ messages, id: threadId }) => {
        const messagesNotInDatabase =
          messages?.filter(({ id }) => !existingMessagesIds.has(id ?? '')) ?? [];

        const relevantMessages = this.filterMessages(
          messagesNotInDatabase,
          sinceDateTimestamp,
          isLatest,
        );

        return this.processMessages(relevantMessages, accountId, threadId as string);
      },
    );

    const processedMessages = await Promise.all(processMessagesPromises);

    threadDetails.push(...processedMessages.flat());

    return threadDetails;
  }

  private filterMessages(
    messages: gmail_v1.Schema$Message[],
    sinceDateTimestamp: number | undefined,
    isLatest: boolean,
  ): gmail_v1.Schema$Message[] {
    if (!sinceDateTimestamp) {
      return messages;
    }

    return messages.filter((message: gmail_v1.Schema$Message) => {
      const messageTimestamp = parseInt(message.internalDate as string, 10) / 1000;
      return isLatest
        ? messageTimestamp > sinceDateTimestamp
        : messageTimestamp < sinceDateTimestamp;
    });
  }

  async processMessages(
    messages: gmail_v1.Schema$Message[],
    accountId: string,
    threadId: string,
  ): Promise<GmailThreadEntity[]> {
    const promises = messages.map(async (message: { id: string }) => {
      const messageDetail = await this.getEmailDetails(message.id);

      const mailInfo = this.extractMailInfo(messageDetail, accountId, threadId);

      return mailInfo;
    });

    const processMessages = await Promise.all(promises);

    return processMessages;
  }

  async getLatestThread(): Promise<GmailThreadEntity | null> {
    return await this.gmailThreadModel.findOne(
      {},
      {
        sort: {
          date: ENUM_PAGINATION_SORT_DIRECTION_TYPE.DESC,
        },
      },
    );
  }

  async getOldestThread(): Promise<GmailThreadEntity | null> {
    return await this.gmailThreadModel.findOne(
      {},
      {
        sort: {
          date: ENUM_PAGINATION_SORT_DIRECTION_TYPE.ASC,
        },
      },
    );
  }

  async getThreadDetails(threadId: string): Promise<gmail_v1.Schema$Thread> {
    const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
    const params = {
      userId: 'me',
      id: threadId,
    };
    const response = await gmail.users.threads.get(params);

    return response.data;
  }

  extractMailInfo(
    message: IMessageInterface,
    accountId: string,
    threadId?: string,
  ): GmailThreadEntity {
    const attachments = this.extractAttachments(message);
    const headers = this.extractHeaders(message);

    const mailInfo = this.constructMailInfoObject(accountId, message, headers, attachments);

    if (threadId) {
      mailInfo.threadId = threadId;
    }

    return mailInfo;
  }

  private extractAttachments(message: IMessageInterface): IAttachmentsResponseInterface[] {
    const attachments: Array<{
      filename: string;
      url?: string;
    }> = [];

    if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.filename && part.filename.length > 0) {
          const attachment = {
            filename: part.filename,
            mimeType: part.mimeType,
            data: part.body?.data,
            url: `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}/attachments/${part.body?.attachmentId}`,
          };
          attachments.push(attachment);
        }
      }
    }

    return attachments;
  }

  private extractHeaders(message: IMessageInterface): gmail_v1.Schema$MessagePartHeader[] {
    return message.payload.headers;
  }

  private constructMailInfoObject(
    accountId: string,
    message: IMessageInterface,
    headers: gmail_v1.Schema$MessagePartHeader[],
    attachments: IAttachmentsResponseInterface[],
  ): GmailThreadEntity {
    return {
      emailId: message.id,
      snippet: message.snippet,
      accountId: new Types.ObjectId(accountId),
      subject: headers.find((header: { name: string }) => header.name === 'Subject')?.value ?? '',
      from: headers.find((header: { name: string }) => header.name === 'From')?.value ?? '',
      cc: headers.find((header: { name: string }) => header.name === 'Cc')?.value ?? '',
      to: headers.find((header: { name: string }) => header.name === 'To')?.value ?? '',
      bcc: headers.find((header: { name: string }) => header.name === 'Bcc')?.value ?? '',
      date: new Date(
        headers.find((header: { name: string }) => header.name === 'Date')?.value ?? '',
      ),
      body: this.getBody(message),
      attachments,
      labelIds: message.labelIds,
      threadId: null,
    };
  }

  getBody(message: IMessageInterface): string {
    try {
      const encodedBody = this.findEncodedBody(message);
      if (!encodedBody) return '';
      return this.decodeBody(encodedBody);
    } catch {
      throw new Error('Error in getBody:');
    }
  }

  private findEncodedBody(message: IMessageInterface): string | null | undefined {
    if (message.payload.parts) {
      const part =
        this.findBodyPart(message.payload.parts, 'text/html') ||
        this.findBodyPart(message.payload.parts, 'text/plain');
      return part ? part.body?.data : '';
    }

    return message.payload.body.data;
  }

  private findBodyPart(
    parts: gmail_v1.Schema$MessagePart[],
    mimeType: string,
  ): gmail_v1.Schema$MessagePart | undefined {
    return parts.find((part: gmail_v1.Schema$MessagePart) => part.mimeType === mimeType);
  }

  private decodeBody(encodedBody: string): string {
    if (!encodedBody) return '';
    const buff = Buffer.from(encodedBody.replaceAll('-', '+').replaceAll('_', '/'), 'base64');
    return buff.toString(`utf-8`);
  }

  async getEmailDetails(messageId: string): Promise<IMessageInterface> {
    const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });
    return response.data as IMessageInterface;
  }

  // /**
  //  * Moves a message to trash in Gmail and updates the database.
  //  * @param id The user's identifier.
  //  * @param threadId The identifier of the email thread.
  //  */
  // async moveToTrash(id: string, threadId: string): Promise<IResponseMessageInterface> {
  //   try {
  //     await this.updateGmailLabel(id, threadId, true);
  //     await this.updateThreadRecord(threadId, {}, true);
  //     return customMessage(HttpStatus.OK, MESSAGE.SUCCESS);
  //   } catch (error) {
  //     console.error('Error in update:', error);
  //     customMessage(HttpStatus.BAD_REQUEST, MESSAGE.BAD_REQUEST);
  //   }
  // }

  // /**
  //  * Restores a message from the trash in Gmail and updates the database.
  //  * @param id The user's identifier.
  //  * @param threadId The identifier of the email thread.
  //  */
  // async restoreFromTrash(id: string, threadId: string): Promise<IResponseMessageInterface> {
  //   try {
  //     await this.updateGmailLabel(id, threadId, false);
  //     await this.updateThreadRecord(threadId, {}, false);
  //     return customMessage(HttpStatus.OK, MESSAGE.SUCCESS);
  //   } catch (error) {
  //     console.error('Error in update:', error);
  //     customMessage(HttpStatus.BAD_REQUEST, MESSAGE.BAD_REQUEST);
  //   }
  // }

  // /**
  //  * Updates the Gmail label by trashing or untrashing the email.
  //  * @param userId The user's identifier.
  //  * @param threadId The identifier of the email thread.
  //  * @param isTrash Indicates if the operation is trashing or untrashing.
  //  */
  // private async updateGmailLabel(userId: string, threadId: string, isTrash: boolean): Promise<void> {
  //   const oAuth2Client = await this.prepareOAuthClient(userId);
  //   if (!oAuth2Client) {
  //     throw new Error(MESSAGE.BAD_REQUEST);
  //   }

  //   const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  //   if (isTrash) {
  //     await gmail.users.messages.trash({ userId: 'me', id: threadId });
  //     return;
  //   }

  //   await gmail.users.messages.untrash({ userId: 'me', id: threadId });
  // }

  // /**
  //  * Updates the database record for a Gmail thread.
  //  * This method handles both label changes and trashing/untrashing logic.
  //  * @param threadId The identifier of the email thread.
  //  * @param labelChanges Object specifying labels to add or remove.
  //  * @param isTrash Optional parameter to indicate trashing or untrashing.
  //  */
  // private async updateThreadRecord(
  //   threadId: string,
  //   labelChanges: { add?: string[]; remove?: string[] },
  //   isTrash?: boolean,
  // ): Promise<void> {
  //   const thread = await this.gmailThreadModel.findOne({
  //     where: { thread_id: threadId },
  //   });
  //   if (!thread) {
  //     throw new Error(MESSAGE.BAD_REQUEST);
  //   }

  //   const labelIds = new Set(thread.label_ids);

  //   // Handle label changes
  //   if (labelChanges.remove) for (const label of labelChanges.remove) labelIds.delete(label);
  //   if (labelChanges.add) for (const label of labelChanges.add) labelIds.add(label);

  //   // Handle trashing logic
  //   if (isTrash !== undefined) {
  //     if (isTrash) {
  //       labelIds.add('TRASH');
  //       labelIds.delete('INBOX');
  //     } else {
  //       labelIds.delete('TRASH');
  //       labelIds.add('INBOX');
  //     }
  //   }

  //   await this.gmailThreadModel.update({ thread_id: threadId }, { label_ids: [...labelIds] });
  // }

  // /**
  //  * Updates read status in Gmail.
  //  * @param oAuth2Client OAuth2Client instance.
  //  * @param threadID Identifier of the email thread.
  //  * @param modifyAction Object specifying labels to add or remove.
  //  */
  // private async updateReadStatus(
  //   oAuth2Client: OAuth2Client,
  //   threadID: string,
  //   modifyAction: { removeLabelIds?: string[]; addLabelIds?: string[] },
  // ): Promise<void> {
  //   const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  //   await gmail.users.messages.modify({
  //     userId: 'me',
  //     id: threadID,
  //     requestBody: modifyAction,
  //   });
  // }

  // /**
  //  * Marks an email as read.
  //  * @param id User identifier.
  //  * @param threadId Email thread identifier.
  //  */
  // async markEmailAsRead(id: string, threadId: string): Promise<ResponseMessageInterface> {
  //   try {
  //     const token = await this.getToken(id);
  //     if (token) {
  //       const oAuth2Client = getOAuthClient(token);
  //       await this.updateReadStatus(oAuth2Client, threadId, {
  //         removeLabelIds: ['UNREAD'],
  //       });
  //       await this.updateThreadRecord(threadId, { remove: ['UNREAD'] });
  //       return customMessage(HttpStatus.OK, MESSAGE.SUCCESS);
  //     }
  //   } catch (error) {
  //     console.error('Error in markEmailAsRead:', error);
  //     customMessage(HttpStatus.BAD_REQUEST, MESSAGE.BAD_REQUEST);
  //   }
  // }

  // /**
  //  * Marks an email as unread.
  //  * @param id User identifier.
  //  * @param threadId Email thread identifier.
  //  */
  // async markEmailAsUnread(id: string, threadId: string): Promise<ResponseMessageInterface> {
  //   try {
  //     const token = await this.getToken(id);
  //     if (token) {
  //       const oAuth2Client = getOAuthClient(token);
  //       await this.updateReadStatus(oAuth2Client, threadId, {
  //         addLabelIds: ['UNREAD'],
  //       });
  //       await this.updateThreadRecord(threadId, { add: ['UNREAD'] });
  //       return customMessage(HttpStatus.OK, MESSAGE.SUCCESS);
  //     }
  //   } catch (error) {
  //     console.error('Error in markEmailAsUnread:', error);
  //     customMessage(HttpStatus.BAD_REQUEST, MESSAGE.BAD_REQUEST);
  //   }
  // }

  // /**
  //  * Downloads an email attachment and sends it as a response.
  //  * @param id User identifier.
  //  * @param url Attachment URL.
  //  * @param response Express response object.
  //  * @returns ResponseMessageInterface for errors
  //  */
  // async downloadAttachment(
  //   accountId: string,
  //   downloadAttachmentDto: DownloadAttachmentDto,
  //   response: Response,
  // ): Promise<ResponseMessageInterface | void> {
  //   try {
  //     const token = await this.validToken(accountId);
  //     if (!token) {
  //       return customMessage(HttpStatus.UNAUTHORIZED, MESSAGE.UNAUTHORIZED);
  //     }

  //     const headers = {
  //       Authorization: `Bearer ${token.access_token}`,
  //       'User-Agent': 'medium-nestjs',
  //     };

  //     const fetchResponse = await fetch(downloadAttachmentDto.url, {
  //       method: 'GET',
  //       headers,
  //     });

  //     if (!fetchResponse.ok) {
  //       return customMessage(HttpStatus.BAD_REQUEST, MESSAGE.BAD_REQUEST);
  //     }

  //     response.setHeader('Content-Disposition', `attachment; filename="${downloadAttachmentDto.filename}"`);
  //     response.setHeader('Content-Type', downloadAttachmentDto.mimeType || 'application/octet-stream');

  //     let responseObj = '';
  //     const transformStream = new Transform({
  //       transform(chunk, encoding, callback) {
  //         const data = chunk.toString().replaceAll('-', '+').replaceAll('_', '/');
  //         responseObj += data;
  //         callback();
  //       },
  //     });

  //     fetchResponse.body.pipe(transformStream).on('finish', () => {
  //       response.setHeader('Content-Disposition', `attachment; filename="${downloadAttachmentDto.filename}"`);
  //       response.setHeader('Content-Type', downloadAttachmentDto.mimeType || 'application/octet-stream');
  //       const base64Data = JSON.parse(responseObj).data;
  //       response.status(HttpStatus.OK);
  //       response.send(Buffer.from(base64Data, 'base64'));
  //     });
  //   } catch (error) {
  //     console.error('Error downloading the attachment:', error);
  //     return customMessage(HttpStatus.BAD_REQUEST, MESSAGE.BAD_REQUEST);
  //   }
  // }

  // /**
  //  * Send an email with the given parameters and attachments.
  //  * @param id - Identifier for the Gmail account.
  //  * @param reqBody - The body of the request containing email fields.
  //  * @param attachments - Array of files to be attached to the email.
  //  * @returns The API response from sending the email.
  //  */
  // async sendEmail(
  //   id: string,
  //   reqBody: SendEmailDto,
  //   attachments: Express.Multer.File[],
  // ): Promise<ResponseMessageInterface> {
  //   const token = await this.getToken(id);
  //   if (!token) {
  //     return customMessage(HttpStatus.UNAUTHORIZED, MESSAGE.UNAUTHORIZED);
  //   }

  //   const user = await this.getUser(id);
  //   const from = this.formatSender(user);

  //   const oAuth2Client = getOAuthClient(token);
  //   const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  //   const rawEmail = this.createRawEmail(
  //     from,
  //     reqBody.to,
  //     attachments,
  //     reqBody.subject,
  //     reqBody.body,
  //     reqBody.cc,
  //     reqBody.bcc,
  //   );

  //   return customMessage(HttpStatus.OK, MESSAGE.SUCCESS, await this.sendRawEmail(gmail, rawEmail));
  // }

  // /**
  //  * Get user details from the repository.
  //  * @param id - Identifier for the Gmail account.
  //  * @returns The user entity.
  //  */
  // private async getUser(id: string): Promise<GmailAccounts> {
  //   const user = await this.gmailAccountModel.findOneBy({ id });
  //   if (!user) throw new Error(MESSAGE.USER_NOT_FOUND);
  //   return user;
  // }

  // /**
  //  * Format the 'from' field for the email.
  //  * @param user - The Gmail user entity.
  //  * @returns The formatted 'from' string.
  //  */
  // private formatSender(user: GmailAccounts): string {
  //   return `${user.full_name} <${user.email}>`;
  // }

  // /**
  //  * Send the raw email using the Gmail API.
  //  * @param gmail - The Gmail API client.
  //  * @param rawEmail - The raw email data in base64 format.
  //  * @returns The API response from sending the email.
  //  */
  // private async sendRawEmail(gmail: gmail_v1.Gmail, rawEmail: string): Promise<gmail_v1.Schema$Message> {
  //   try {
  //     const response = await gmail.users.messages.send({
  //       userId: 'me',
  //       requestBody: {
  //         raw: rawEmail,
  //       },
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error sending email: ' + error.message);
  //     throw new Error(MESSAGE.BAD_REQUEST);
  //   }
  // }

  // /**
  //  * Creates a raw email message ready to be sent via the Gmail API.
  //  *
  //  * @param from - The email address of the sender.
  //  * @param to - The recipient(s) email address(es).
  //  * @param subject - The subject line of the email.
  //  * @param body - The HTML body of the email.
  //  * @param attachments - An array of attachments to be included in the email.
  //  * @param cc - Optional CC recipient(s).
  //  * @param bcc - Optional BCC recipient(s).
  //  * @returns The raw email string in base64 format.
  //  */
  // private createRawEmail(
  //   from: string,
  //   to: string | string[],
  //   attachments: Express.Multer.File[],
  //   subject?: string,
  //   body?: string,
  //   cc?: string | string[],
  //   bcc?: string | string[],
  // ): string {
  //   const utf8Subject = this.encodeSubject(subject);
  //   const messageParts = [
  //     this.formatHeader(from, to, utf8Subject),
  //     ...this.addCcBcc(cc, bcc),
  //     '--foo_bar_baz',
  //     'Content-Type: text/html; charset=utf-8',
  //     'MIME-Version: 1.0',
  //     '',
  //     body,
  //     ...this.addAttachments(attachments),
  //     '--foo_bar_baz--',
  //   ];

  //   return this.encodeEmail(messageParts.join('\n'));
  // }

  // /**
  //  * Encodes the subject of the email to UTF-8.
  //  *
  //  * @param subject - The subject line of the email.
  //  * @returns The UTF-8 encoded subject.
  //  */
  // private encodeSubject(subject: string): string {
  //   return `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  // }

  // /**
  //  * Formats the email header section.
  //  *
  //  * @param from - The email address of the sender.
  //  * @param to - The recipient(s) email address(es).
  //  * @param utf8Subject - The UTF-8 encoded subject line.
  //  * @returns An array of header strings.
  //  */
  // private formatHeader(from: string, to: string | string[], utf8Subject: string): string {
  //   return [
  //     `From: ${from}`,
  //     `To: ${Array.isArray(to) ? to.join(', ') : to}`,
  //     'Content-Type: multipart/mixed; boundary="foo_bar_baz"',
  //     'MIME-Version: 1.0',
  //     `Subject: ${utf8Subject}`,
  //     '',
  //   ].join('\n');
  // }

  // /**
  //  * Adds CC and BCC recipients to the email.
  //  *
  //  * @param cc - Optional CC recipient(s).
  //  * @param bcc - Optional BCC recipient(s).
  //  * @returns An array of CC and BCC header strings.
  //  */
  // private addCcBcc(cc?: string | string[], bcc?: string | string[]): string[] {
  //   const headers = [];
  //   if (cc) {
  //     headers.push(`Cc: ${Array.isArray(cc) ? cc.join(', ') : cc}`);
  //   }

  //   if (bcc) {
  //     headers.push(`Bcc: ${Array.isArray(bcc) ? bcc.join(', ') : bcc}`);
  //   }

  //   return headers;
  // }

  // /**
  //  * Adds attachments to the email.
  //  *
  //  * @param attachments - An array of attachments to be included in the email.
  //  * @returns An array of attachment strings formatted for the raw email.
  //  */
  // private addAttachments(attachments: Express.Multer.File[]): string[] {
  //   return attachments.map((attachment) => {
  //     const encodedContent = attachment.buffer.toString('base64');
  //     return [
  //       '--foo_bar_baz',
  //       `Content-Type: ${attachment.mimetype}; name="${attachment.originalname}"`,
  //       'Content-Transfer-Encoding: base64',
  //       `Content-Disposition: attachment; filename="${attachment.originalname}"`,
  //       '',
  //       encodedContent,
  //     ].join('\n');
  //   });
  // }

  // /**
  //  * Encodes the email body to base64 format, making it suitable for sending via the Gmail API.
  //  *
  //  * @param emailBody - The full raw email body string.
  //  * @returns The base64 encoded email body.
  //  */
  // private encodeEmail(emailBody: string): string {
  //   return Buffer.from(emailBody).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
  // }
}
