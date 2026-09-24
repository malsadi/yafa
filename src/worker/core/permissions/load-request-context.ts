import { isAdministrationPanelCapability } from '../../../shared/core/administration-panel-capability';
import { listCapabilityDefinitions } from './capability-catalogue';
import { findPersonByClerkUserId } from './people-repo';
import { findAllCapabilitiesForCurrentTerms } from './permission-grants-repo';
import type { RequestContext } from './request-context';
import { isSystemAdministrator } from './system-administrators-repo';
import { findCurrentTerms } from './terms-repo';
import { getTodayInLondon } from './today-in-london';

export type LoadRequestContextResult =
  { status: 'active'; context: RequestContext } | { status: 'not-active' };

/**
 * Brief section 6.2: "a signed-in user with no linked person holding a
 * current term sees only the access not active page" — no linked person and
 * a linked person with no current term both collapse to 'not-active' here,
 * since the brief does not distinguish them for the officer.
 */
export async function loadRequestContext(
  db: D1Database,
  clerkUserId: string,
): Promise<LoadRequestContextResult> {
  const person = await findPersonByClerkUserId(db, clerkUserId);
  if (!person) {
    return { status: 'not-active' };
  }

  const today = getTodayInLondon();
  const currentTerms = await findCurrentTerms(db, person.id, today);
  if (currentTerms.length === 0) {
    return { status: 'not-active' };
  }

  const [grantedCapabilities, isSystemAdmin] = await Promise.all([
    findAllCapabilitiesForCurrentTerms(db, person.id, today),
    isSystemAdministrator(db, person.id),
  ]);
  // D-046: the UI hint mirrors can() — system administrators hold every
  // catalogued Administration panel capability.
  const adminCapabilities = isSystemAdmin
    ? listCapabilityDefinitions()
        .map((definition) => definition.capability)
        .filter(isAdministrationPanelCapability)
    : [];
  const capabilities = [...new Set([...grantedCapabilities, ...adminCapabilities])];

  return {
    status: 'active',
    context: {
      personId: person.id,
      units: [...new Set(currentTerms.map((term) => term.unitId))],
      roles: [...new Set(currentTerms.map((term) => term.roleId))],
      capabilities,
      isSystemAdmin,
    },
  };
}
