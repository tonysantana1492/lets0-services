import type { ModuleMetadata } from '@nestjs/common';

export interface ISaveMetadata {
  contentType?: string;
  cacheControl?: string;
}

export interface IGCloudStorageModuleOptions {
  projectId: string;
  bucketName: string;
  keyFilename?: string;
}

export interface IGCloudStorageModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: any[]
  ) => IGCloudStorageModuleOptions | Promise<IGCloudStorageModuleOptions>;
  inject?: any[];
}
