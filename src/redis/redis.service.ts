import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService as NestRedisService } from '@liaoliaots/nestjs-redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private readonly nestRedisService: NestRedisService) {}

  async onModuleInit() {
    this.redisClient = this.nestRedisService.getOrThrow('default');
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  async setCache(key: string, value: string, ttl: number): Promise<void> {
    await this.redisClient.set(key, value, 'EX', ttl);
  }

  async getCache(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async deleteCache(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }

  async clearAll(): Promise<void> {
    await this.redisClient.flushall();
  }
}
