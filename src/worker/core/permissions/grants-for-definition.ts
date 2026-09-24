import type { CapabilityDefinition } from './capability-catalogue.schema';
import { findDesignatedTerms } from './designated-terms-repo';
import { findGrantsForCapability, type GrantForCapability } from './permission-grants-repo';

/**
 * The grants that count for one capability and one person today. A fixed
 * capability (brief 7.3) takes its grants only from the person's designated
 * roles, each at the unit of that term; the matrix is ignored. Any other
 * capability takes the matrix grants, kept to its allowed scopes (T-048).
 */
export async function grantsForDefinition(
  db: D1Database,
  definition: CapabilityDefinition,
  personId: string,
  today: string,
): Promise<GrantForCapability[]> {
  if (definition.fixedGrants) {
    const fixedGrants = definition.fixedGrants;
    const designated = await findDesignatedTerms(db, personId, today);
    return designated.flatMap((term) =>
      fixedGrants
        .filter((fixed) => fixed.designation === term.designation)
        .map((fixed) => ({ unitId: term.unitId, scope: fixed.scope })),
    );
  }
  const matrixGrants = await findGrantsForCapability(db, personId, definition.capability, today);
  return matrixGrants.filter((grant) => definition.allowedScopes.includes(grant.scope));
}
