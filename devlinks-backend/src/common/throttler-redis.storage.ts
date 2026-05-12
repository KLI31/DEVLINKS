import { ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import { RedisService } from '../redis/redis.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerRedisStorage implements ThrottlerStorage {
  constructor(private readonly redisService: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const hitsKey = `throttler:hits:${throttlerName}:${key}`;
    const blockKey = `throttler:block:${throttlerName}:${key}`;
    const redis = this.redisService.getClient();

    const pipeline = redis.pipeline();
    pipeline.incr(hitsKey);

    const results = await pipeline.exec();
    const totalHits = (results?.[0]?.[1] as number) ?? 1;

    if (totalHits === 1) {
      await redis.pexpire(hitsKey, ttl);
    }

    const timeToExpire = await redis.pttl(hitsKey);

    if (totalHits > limit) {
      await redis.set(blockKey, '1', 'PX', blockDuration);
    }

    const timeToBlockExpire = await redis.pttl(blockKey);

    return {
      totalHits,
      timeToExpire: Math.max(0, timeToExpire),
      isBlocked: timeToBlockExpire > 0,
      timeToBlockExpire: Math.max(0, timeToBlockExpire),
    };
  }
}
