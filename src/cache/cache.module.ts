import KeyvRedis from '@keyv/redis';
import { Module } from '@nestjs/common';
import { config } from 'dotenv';
import { Keyv } from 'keyv';
import { CacheService } from './cache.service';

config();

@Module({
  providers: [
    {
      provide: 'KEYV_INSTANCE',
      useFactory: () =>
        new Keyv({
          store: new KeyvRedis({
            url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
            password: process.env.REDIS_PASSWORD,
            socket: {
              host: process.env.REDIS_HOST,
              port: parseInt(process.env.REDIS_PORT),
            },
          }),
        }),
    },
    CacheService,
  ],
  exports: ['KEYV_INSTANCE'],
})
export class KeyvModule {}
