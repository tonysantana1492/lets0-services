import type { Bucket } from '@google-cloud/storage';
import type { SaveData } from '@google-cloud/storage/build/cjs/src/file';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { Storage } from '@google-cloud/storage';

import type { ISaveMetadata } from '../interfaces/gcloud-storage.interface';
import { GCLOUD_STORAGE_CONFIG } from '../constants/gcloud-storage.constants';
import { IGCloudStorageModuleOptions } from '../interfaces/gcloud-storage.interface';

@Injectable()
export class GCloudStorageService {
  private readonly logger: Logger = new Logger(GCloudStorageService.name);

  readonly storage: Storage;

  readonly bucket: Bucket;

  constructor(@Inject(GCLOUD_STORAGE_CONFIG) options: IGCloudStorageModuleOptions) {
    this.storage = new Storage({ projectId: options.projectId, keyFilename: options.keyFilename });
    this.bucket = this.storage.bucket(options.bucketName);
  }

  async saveFile(filename: string, data: SaveData, metadata?: ISaveMetadata): Promise<string> {
    try {
      await this.bucket.file(filename).save(data, { metadata });

      return `https://storage.googleapis.com/${this.bucket.name}/${encodeURIComponent(filename)}`;
    } catch (error) {
      this.logger.error(error.message, error.stack);

      return '';
    }
  }

  async saveFiles(
    files: Array<{ filename: string; data: SaveData; metadata?: ISaveMetadata }>,
  ): Promise<string[]> {
    return Promise.all(
      files.map(({ filename, data, metadata }) => this.saveFile(filename, data, metadata)),
    );
  }

  deleteFile(filename: string): Promise<any> {
    return this.bucket.file(filename).delete();
  }
}
