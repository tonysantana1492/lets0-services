/** Dependencies **/
import type { SendMailOptions } from 'nodemailer';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface MailerSendMailOptions extends SendMailOptions {
  template?: string;
  context?: any;
}
