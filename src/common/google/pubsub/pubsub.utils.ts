import { PubSub } from '@google-cloud/pubsub';
import { credentials } from '@grpc/grpc-js';

import type { IPubSubClientConfig, IPubSubOptions } from './pubsub.types';

export const getClientConfig = (
  settings?: IPubSubClientConfig,
): IPubSubClientConfig | undefined => {
  const { emulatorPort, ...config } = settings ?? { emulatorPort: 8085 };

  return emulatorPort
    ? {
        servicePath: 'localhost',
        port: emulatorPort,
        sslCreds: credentials.createInsecure(),
        ...config,
      }
    : config;
};

export const pubSubFactory = (options: IPubSubOptions): PubSub =>
  options.pubSub ?? new PubSub(getClientConfig(options.clientConfig));
