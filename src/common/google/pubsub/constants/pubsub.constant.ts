export const TopicNames = {
  TESTING: 'testing',
} as const;

export type TopicName = (typeof TopicNames)[keyof typeof TopicNames];
