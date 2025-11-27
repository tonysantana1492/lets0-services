import type Mail from 'nodemailer/lib/mailer';

export interface IMailOptions extends Mail.Options {
  from: string;

  to: string;

  replyTo: string;

  subject: string;

  text: string;

  textEncoding?: Mail.TextEncoding;

  cc?: string;

  html?: string;

  link?: string;
}
