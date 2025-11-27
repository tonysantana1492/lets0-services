/** Interfaces **/
import type { MailerOptions } from './mailer-options.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface MailerOptionsFactory {
  createMailerOptions(): Promise<MailerOptions> | MailerOptions;
}
