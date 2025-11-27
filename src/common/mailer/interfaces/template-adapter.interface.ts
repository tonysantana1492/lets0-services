/** Interfaces **/
import type { MailerOptions } from './mailer-options.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface TemplateAdapter {
  compile(mail: any, callback: (err?: any, body?: string) => any, options: MailerOptions): void;
}
