import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';

@Injectable()
export class PermissionCatalogService {
  constructor(private readonly permissionRepo: PermissionRepository) {}

  listAll() {
    return this.permissionRepo.findAll();
  }

  async seedDefaults() {
    await this.permissionRepo.upsertMany([
      {
        key: 'invoice.read',
        category: 'invoice',
        description: 'Read invoices',
      },
      {
        key: 'invoice.add',
        category: 'invoice',
        description: 'Create invoices',
      },
      {
        key: 'invoice.delete',
        category: 'invoice',
        description: 'Delete invoices',
      },
      {
        key: 'roles.manage',
        category: 'access',
        description: 'Manage roles & permissions',
      },
      {
        key: 'members.manage',
        category: 'access',
        description: 'Manage tenant members',
      },
    ]);
  }
}
