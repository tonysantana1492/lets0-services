import type { Subscription, Topic } from '@google-cloud/pubsub';
import type { OnModuleDestroy } from '@nestjs/common';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { PubSub } from '@google-cloud/pubsub';

import type { TopicName } from '../constants/pubsub.constant';
import { IPubSubOptions } from '../pubsub.types';

@Injectable()
export class PubSubService implements OnModuleDestroy {
  private readonly logger: Logger;

  private readonly topics = new Map<string, Topic>();

  private readonly subscriptions = new Map<string, Subscription>();

  constructor(
    public readonly pubSub: PubSub,
    private options: IPubSubOptions,
  ) {
    this.logger = new Logger(PubSubService.name);

    if (options?.clientConfig?.emulatorPort) {
      this.logger.debug(`Using PubSub emulator at port ${options.clientConfig.emulatorPort}`);
    }
  }

  getTopic(topicName: string) {
    const cachedTopic = this.topics.get(topicName);

    if (!cachedTopic) {
      try {
        const topic = this.pubSub.topic(topicName);

        this.topics.set(topicName, topic);

        return topic;
      } catch (error) {
        this.logger.error(`Failed to get topic ${topicName}`, error.stack);

        throw new InternalServerErrorException(`Failed to get topic ${topicName}`);
      }
    }

    return cachedTopic;
  }

  getSubscription(topicName: TopicName, subscriptionName: string) {
    const cashedSubscription = this.subscriptions.get(subscriptionName);

    if (!cashedSubscription) {
      try {
        const topic = this.getTopic(topicName);
        const subscription = topic.subscription(subscriptionName);

        this.subscriptions.set(subscriptionName, subscription);

        return subscription;
      } catch (error) {
        this.logger.error(`Failed to get subscription ${subscriptionName}`, error.stack);
      }
    }

    return cashedSubscription;
  }

  public async onModuleDestroy(): Promise<void> {
    await Promise.all([...this.subscriptions.values()].map((subscription) => subscription.close()));
  }
}
