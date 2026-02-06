import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../entities/permission.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class PermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.repository.find({ order: { category: 'ASC', key: 'ASC' } });
  }

  findByKeys(keys: string[]): Promise<Permission[]> {
    if (!keys.length) return Promise.resolve([]);
    return this.repository.find({ where: { key: In(keys) } });
  }

  async upsertMany(
    perms: Array<Pick<Permission, 'key' | 'category' | 'description'>>,
  ): Promise<void> {
    if (!perms.length) return;
    // Postgres ON CONFLICT works via upsert
    await this.repository.upsert(perms, ['key']);
  }
}
