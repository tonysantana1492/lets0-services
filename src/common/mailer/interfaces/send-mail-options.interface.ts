import type { SendMailOptions } from 'nodemailer';
import type * as DKIM from 'nodemailer/lib/dkim';
import type { Attachment } from 'nodemailer/lib/mailer';

export type TextEncoding = 'quoted-printable' | 'base64';
// eslint-disable-next-line no-redeclare
export type Headers =
  | Record<string, string | string[] | { prepared: boolean; value: string }>
  | Array<{ key: string; value: string }>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface Address {
  name: string;
  address: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface AttachmentLikeObject {
  path: string;
}

export interface ISendMailOptions extends SendMailOptions {
  to?: string | Address | Array<string | Address>;
  cc?: string | Address | Array<string | Address>;
  bcc?: string | Address | Array<string | Address>;
  replyTo?: string | Address | Array<string | Address>;
  inReplyTo?: string | Address;
  from?: string | Address;
  subject?: string;
  text?: string | Buffer | AttachmentLikeObject;
  html?: string | Buffer;
  sender?: string | Address;
  raw?: string | Buffer;
  textEncoding?: TextEncoding;
  references?: string | string[];
  encoding?: string;
  date?: Date | string;
  headers?: Headers;
  context?: Record<string, any>;
  transporterName?: string;
  template?: string;
  attachments?: Attachment[];
  dkim?: DKIM.Options;
}
