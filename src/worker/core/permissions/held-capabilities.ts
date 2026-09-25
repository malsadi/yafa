import { listCapabilityDefinitions } from './capability-catalogue';
import { findDesignatedTerms } from './designated-terms-repo';
import { findAllCapabilitiesForCurrentTerms } from './permission-grants-repo';

/**
 * The capabilities a person holds today somewhere, by the same split `can()`
 * makes (grants-for-definition.ts): a fixed capability comes only from a
 * designated role's term, never the matrix; any other only from the matrix.
 * The UI hint of the request context (T-042, D-072).
 */
export async function findHeldCapabilities(
  db: D1Database,
  personId: string,
  today: string,
): Promise<string[]> {
  const [matrix, designated] = await Promise.all([
    findAllCapabilitiesForCurrentTerms(db, personId, today),
    findDesignatedTerms(db, personId, today),
  ]);
  const designations = new Set(designated.map((term) => term.designation));
  return listCapabilityDefinitions()
    .filter((definition) =>
      definition.fixedGrants
        ? definition.fixedGrants.some((fixed) => designations.has(fixed.designation))
        : matrix.includes(definition.capability),
    )
    .map((definition) => definition.capability);
}
