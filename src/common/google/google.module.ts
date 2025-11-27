import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ENUM_APP_ENVIRONMENT } from '@/common/app-config/enums/app.enum';
import { IAppConfigInterface } from '@/common/app-config/interfaces/app.config.interface';
import { IGoogleConfigInterface } from '@/common/app-config/interfaces/google.config.interface';

import { GoogleMapsModule } from './maps/google-maps.module';
import { GoogleAuthModule } from './oauth2/google-auth.module';
import { GooglePubsubModule } from './pubsub/google-pubsub.module';
import { GoogleRecaptchaModule } from './recaptcha/google-recaptcha.module';
import { GoogleStorageModule } from './storage/google-storage.module';

@Global()
@Module({
  providers: [],
  // exports: [GoogleMapsModule, GoogleStorageModule],
  exports: [GoogleAuthModule, GoogleRecaptchaModule, GoogleMapsModule, GoogleStorageModule],
  controllers: [],
  imports: [
    GoogleAuthModule,
    GoogleRecaptchaModule,
    GoogleMapsModule,
    GoogleStorageModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        (configService.get('google') as IGoogleConfigInterface).storage,
    }),
    GooglePubsubModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        clientConfig: {
          projectId: (configService.get('google') as IGoogleConfigInterface).pubSub.auth.projectId,
          keyFilename: (configService.get('google') as IGoogleConfigInterface).pubSub.auth
            .keyFilename,
          ...((configService.get('app') as IAppConfigInterface).env ===
            ENUM_APP_ENVIRONMENT.DEVELOPMENT && {
            emulatorPort: (configService.get('google') as IGoogleConfigInterface).pubSub
              .emulatorPort,
            apiEndpoint: 'localhost',
          }),
        },
      }),
    }),
  ],
})
export class GoogleModule {}
