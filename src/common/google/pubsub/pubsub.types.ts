import type { ClientConfig, PubSub } from '@google-cloud/pubsub';
import type { Provider, Type } from '@nestjs/common';

export type Token = string | symbol;
export interface IPubSubOptions {
  pubSub?: PubSub;
  clientConfig?: IPubSubClientConfig;
}
export interface IPubSubClientConfig extends ClientConfig {
  emulatorPort?: number;
}

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type SettingsProvider<T> = Exclude<Provider<T>, Type>;

export type PubSubModuleAsyncOptions = DistributiveOmit<
  SettingsProvider<IPubSubOptions>,
  'provide'
>;
export type PubSubProviderOptions = Exclude<Provider<IPubSubOptions>, Type>;
