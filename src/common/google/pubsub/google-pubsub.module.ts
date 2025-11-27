import type { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { PubSub } from '@google-cloud/pubsub';

import type {
  IPubSubOptions,
  PubSubModuleAsyncOptions,
  PubSubProviderOptions,
} from './pubsub.types';
import { pubSubFactory } from './pubsub.utils';
import { PubSubPublisherService } from './services/pubsub-publisher.service';
import { PubSubService } from './services/pubsub.service';

const PubSubSettings = Symbol('PubSubSettings');

@Module({})
export class GooglePubsubModule {
  static forRootAsync(options: PubSubModuleAsyncOptions): DynamicModule {
    return {
      module: GooglePubsubModule,
      global: true,
      providers: [
        <PubSubProviderOptions>{
          provide: PubSubSettings,
          ...options,
        },
        {
          provide: PubSub,
          inject: [PubSubSettings],
          useFactory: pubSubFactory,
        },
        {
          provide: PubSubService,
          inject: [PubSub, PubSubSettings],
          useFactory: (pubSub: PubSub, settings: IPubSubOptions) =>
            new PubSubService(pubSub, settings),
        },
        PubSubPublisherService,
      ],
      exports: [PubSubService, PubSubPublisherService],
    };
  }
}
