import type {
  IGCloudStorageModuleAsyncOptions,
  IGCloudStorageModuleOptions,
} from '@/common/google/storage/interfaces/gcloud-storage.interface';
import type { DynamicModule } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';

import { GCLOUD_STORAGE_CONFIG } from '@/common/google/storage/constants/gcloud-storage.constants';
import { GCloudStorageService } from '@/common/google/storage/services/gcloud-storage.service';

@Global()
@Module({})
export class GoogleStorageModule {
  static registerAsync(options: IGCloudStorageModuleAsyncOptions): DynamicModule {
    return {
      module: GoogleStorageModule,
      imports: options.imports,
      providers: [
        {
          provide: GCLOUD_STORAGE_CONFIG,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        {
          provide: GCloudStorageService,
          useFactory: (config: IGCloudStorageModuleOptions) => new GCloudStorageService(config),
          inject: [GCLOUD_STORAGE_CONFIG],
        },
      ],
      exports: [GCloudStorageService],
    };
  }
}
