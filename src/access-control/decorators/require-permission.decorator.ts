import { applyDecorators, SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSIONS_KEY = 'required_permissions';
export const PERMISSION_MODE_KEY = 'permission_mode';

export type PermissionMode = 'ALL' | 'ANY';

export const RequirePermission = (...permissions: string[]) =>
  applyDecorators(
    SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions),
    SetMetadata(PERMISSION_MODE_KEY, 'ALL' as PermissionMode),
  );

export const RequireAnyPermission = (...permissions: string[]) =>
  applyDecorators(
    SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions),
    SetMetadata(PERMISSION_MODE_KEY, 'ANY' as PermissionMode),
  );
