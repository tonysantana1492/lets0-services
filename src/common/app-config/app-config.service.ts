import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

import { IAppConfigInterface } from '@/common/app-config/interfaces/app.config.interface';
import { IDatabaseConfigInterface } from '@/common/app-config/interfaces/database.config.interface';
import { IDocConfigInterface } from '@/common/app-config/interfaces/doc.config.interface';
import { IEmailConfigInterface } from '@/common/app-config/interfaces/email.config.interface';
import { IGoogleConfigInterface } from '@/common/app-config/interfaces/google.config.interface';
import { IJwtConfigInterface } from '@/common/app-config/interfaces/jwt.config.interface';
import { IMessageConfigInterface } from '@/common/app-config/interfaces/message.config.interface';
import { IRequestConfig } from '@/common/app-config/interfaces/request.config.interface';
import { IStripeConfigInterface } from '@/common/app-config/interfaces/stripe.config.interface';
import { ITurnstileConfigInterface } from '@/common/app-config/interfaces/turnstile.interface';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get slackWebhookUrl(): string {
    return this.configService.get<string>('SLACK_INC_WEBHOOK_URL') as string;
  }

  private get environment(): string {
    return this.configService.get<string>('NODE_ENV') as string;
  }

  get appConfig(): IAppConfigInterface {
    return this.configService.get('app') as IAppConfigInterface;
  }

  get messageConfig(): IMessageConfigInterface {
    return this.configService.get('message') as IMessageConfigInterface;
  }

  get requestConfig(): IRequestConfig {
    return this.configService.get('request') as IRequestConfig;
  }

  get jwtConfig(): IJwtConfigInterface {
    return this.configService.get('jwt') as IJwtConfigInterface;
  }

  get emailConfig(): IEmailConfigInterface {
    return this.configService.get('email') as IEmailConfigInterface;
  }

  get databaseConfig(): IDatabaseConfigInterface {
    return this.configService.get('database') as IDatabaseConfigInterface;
  }

  get googleConfig(): IGoogleConfigInterface {
    return this.configService.get('google') as IGoogleConfigInterface;
  }

  get docConfig(): IDocConfigInterface {
    return this.configService.get('doc') as IDocConfigInterface;
  }

  get stripeConfig(): IStripeConfigInterface {
    return this.configService.get('stripe') as IStripeConfigInterface;
  }

  get turnstileConfig(): ITurnstileConfigInterface {
    return this.configService.get('turnstile') as ITurnstileConfigInterface;
  }
}
