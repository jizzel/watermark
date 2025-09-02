import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultSettings: {
    attempts: parseInt(process.env.QUEUE_RETRY_ATTEMPTS || '3'),
    backoff: {
      type: 'exponential',
      delay: parseInt(process.env.QUEUE_RETRY_DELAY || '1000'),
      removeOnComplete: true,
      removeOnFail: false,
    },
  },
}));
