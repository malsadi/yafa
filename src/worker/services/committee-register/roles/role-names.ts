import { ConflictError } from '../../../core/errors';
import type { RoleRecord } from './roles.schema';

/**
 * Brief 14 B2: the same role means the same thing everywhere, so no two
 * roles a unit can use share a name, in either language. `existing` is
 * every role in that scope; the role being renamed is left out.
 */
export function requireUniqueRoleNames(
  existing: RoleRecord[],
  names: { nameEn: string; nameAr: string },
  excludeRoleId?: string,
): void {
  const clash = existing.some(
    (role) =>
      role.id !== excludeRoleId &&
      (role.nameEn.toLowerCase() === names.nameEn.toLowerCase() || role.nameAr === names.nameAr),
  );
  if (clash) {
    throw new ConflictError('roles.name-taken');
  }
}
