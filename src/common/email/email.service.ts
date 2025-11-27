import { Injectable } from '@nestjs/common';

import { ERROR_CODES } from '../error/constants/error-code';
import { AppRequestException } from '../error/exceptions/app-request.exception';
import { ISendMailOptions } from '../mailer/interfaces/send-mail-options.interface';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendMail(options: ISendMailOptions) {
    try {
      await this.mailerService.sendMail(options);
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.EMAIL_SEND_ERROR, errors: [error] });
    }
  }
}
