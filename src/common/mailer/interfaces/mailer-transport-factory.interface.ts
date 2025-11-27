import type Mail from 'nodemailer/lib/mailer';

import type { TransportType } from './mailer-options.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface MailerTransportFactory {
  createTransport(opts?: TransportType): Mail;
}
