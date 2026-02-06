import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS } from 'src/core/redis/redis.module';

@Injectable()
export class PermissionCacheService {
  private readonly ttlSeconds = 60 * 10; // 10 minutes

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  private key(membershipId: number) {
    return `perm:membership:${membershipId}`;
  }

  async get(membershipId: number): Promise<string[] | null> {
    const raw = await this.redis.get(this.key(membershipId));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  async set(membershipId: number, permissions: string[]) {
    await this.redis.set(
      this.key(membershipId),
      JSON.stringify(permissions),
      'EX',
      this.ttlSeconds,
    );
  }

  async invalidateMembership(membershipId: number) {
    await this.redis.del(this.key(membershipId));
  }

  async invalidateManyMemberships(membershipIds: number[]) {
    if (!membershipIds.length) return;
    const keys = membershipIds.map((id) => this.key(id));
    await this.redis.del(...keys);
  }
}
