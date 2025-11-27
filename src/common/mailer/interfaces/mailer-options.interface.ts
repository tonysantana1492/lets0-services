/** Interfaces **/
import type { Transport, TransportOptions } from 'nodemailer';
import type * as JSONTransport from 'nodemailer/lib/json-transport';
import type * as SendmailTransport from 'nodemailer/lib/sendmail-transport';
import type * as SESTransport from 'nodemailer/lib/ses-transport';
import type * as SMTPPool from 'nodemailer/lib/smtp-pool';
import type * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import type * as StreamTransport from 'nodemailer/lib/stream-transport';

import type { TemplateAdapter } from './template-adapter.interface';

type Options =
  | SMTPTransport.Options
  | SMTPPool.Options
  | SendmailTransport.Options
  | StreamTransport.Options
  | JSONTransport.Options
  | SESTransport.Options
  | TransportOptions;

export type TransportType =
  | Options
  | SMTPTransport
  | SMTPPool
  | SendmailTransport
  | StreamTransport
  | JSONTransport
  | SESTransport
  | Transport
  | string;

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface MailerOptions {
  defaults?: Options;
  transport?: TransportType;
  transports?: Record<string, SMTPTransport | SMTPTransport.Options | string>;
  template?: {
    dir?: string;
    adapter?: TemplateAdapter;
    options?: Record<string, any>;
  };
  options?: Record<string, any>;
  preview?:
    | boolean
    | Partial<{
        /**
         * a path to a directory for saving the generated email previews
         * (defaults to os.tmpdir() from os)
         *
         * @see https://nodejs.org/api/os.html#os_os_tmpdir
         * @type {string}
         */
        dir: string;
        /**
         * an options object that is passed to `open` (defaults to { wait: false })
         *
         * @see https://github.com/sindresorhus/open#options
         * @type {(boolean | { wait: boolean; app: string | string[] })}
         */
        open: boolean | { wait: boolean; app: string | string[] };
      }>;
  verifyTransporters?: boolean;
}
