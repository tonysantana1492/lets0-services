/** Dependencies **/
import type { Provider } from '@nestjs/common';
import type { ModuleMetadata, Type } from '@nestjs/common/interfaces';

import type { MailerOptionsFactory } from './mailer-options-factory.interface';
/** Interfaces **/
import type { MailerOptions } from './mailer-options.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface MailerAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<MailerOptionsFactory>;
  useExisting?: Type<MailerOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<MailerOptions> | MailerOptions;
  extraProviders?: Provider[];
}
