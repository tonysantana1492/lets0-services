import type { Topic } from '@google-cloud/pubsub';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import type { TopicName } from '../constants/pubsub.constant';
import type { BaseEvent } from '../interface/base.event';
import { PubSubService } from './pubsub.service';

@Injectable()
export class PubSubPublisherService {
  constructor(private readonly pubSubService: PubSubService) {}

  async publishMessage(
    { topicName, type, payload }: BaseEvent,
    attributes: Record<string, string> = {},
  ): Promise<string> {
    const topic = this.pubSubService.getTopic(topicName);

    return this.publishToTopicRaw(
      topic,
      Buffer.from(JSON.stringify({ type, payload })),
      attributes,
    );
  }

  async publishRaw(
    topicName: TopicName,
    data: Buffer,
    attributes: Record<string, string> = {},
  ): Promise<string> {
    const topic = this.pubSubService.getTopic(topicName);

    return this.publishToTopicRaw(topic, data, attributes);
  }

  async publishToTopicRaw(
    topic: Topic,
    data: Buffer,
    attributes: Record<string, string>,
  ): Promise<string> {
    const messageId = (await topic.publishMessage({ data, attributes })) || '';

    if (!messageId) {
      throw new InternalServerErrorException(`Failed to publish message to ${topic.name}`);
    }

    return messageId;
  }
}
