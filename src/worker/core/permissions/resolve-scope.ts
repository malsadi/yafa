import { PermissionScope } from '../../../shared/core/permission-scope';
import type { GrantForCapability } from './permission-grants-repo';

/**
 * T-041: whether one grant row lets its holder act on `requestedUnitId`.
 * `isRequestedUnitNational` is only needed to evaluate a `national
 * content`-scoped grant (T-050: checked against the requested unit's own
 * `type`, not "the" national unit's id); pass `false` when nothing being
 * checked uses that scope.
 */
export function resolveScope(
  grant: GrantForCapability,
  requestedUnitId: string,
  isRequestedUnitNational: boolean,
): boolean {
  switch (grant.scope) {
    case PermissionScope.AllUnits:
      return true;
    case PermissionScope.OwnUnit:
      return grant.unitId === requestedUnitId;
    case PermissionScope.NationalContent:
      return isRequestedUnitNational;
  }
}
