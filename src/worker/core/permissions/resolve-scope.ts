import { PermissionScope } from '../../../shared/core/permission-scope';
import type { GrantForCapability } from './permission-grants-repo';

/**
 * T-041: whether one grant row lets its holder act on `requestedUnitId`.
 * `nationalUnitId` is only needed to evaluate a `national content`-scoped
 * grant; pass `undefined` when nothing being checked uses that scope.
 */
export function resolveScope(
  grant: GrantForCapability,
  requestedUnitId: string,
  nationalUnitId: string | undefined,
): boolean {
  switch (grant.scope) {
    case PermissionScope.AllUnits:
      return true;
    case PermissionScope.OwnUnit:
      return grant.unitId === requestedUnitId;
    case PermissionScope.NationalContent:
      return nationalUnitId !== undefined && requestedUnitId === nationalUnitId;
  }
}
