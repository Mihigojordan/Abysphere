// src/global/redis/redis.provider.ts
import { Provider } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';

export const RedisProvider: Provider = {
  provide: 'REDIS',
  useFactory: async (): Promise<RedisClientType> => {
    const client: RedisClientType = createClient({
      socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    await client.connect(); // Connect to Redis
    console.log('✅ Redis connected successfully');
    return client;
  },
};
