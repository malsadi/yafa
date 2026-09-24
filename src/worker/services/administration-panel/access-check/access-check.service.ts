import { ForbiddenError, NotFoundError } from '../../../core/errors';
import {
  can,
  describeAccess,
  getTodayInLondon,
  isSystemAdministrator,
  type AccessGrant,
  type RequestContext,
} from '../../../core/permissions';
import { listCurrentTermsOf, listPeopleNames } from '../../committee-register';

const CAPABILITY = 'administration-panel.access-check.read';

async function requireCapability(db: D1Database, ctx: RequestContext): Promise<void> {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
}

export interface AccessCheck {
  personId: string;
  name: string;
  isSystemAdministrator: boolean;
  currentTerms: Awaited<ReturnType<typeof listCurrentTermsOf>>;
  grants: AccessGrant[];
}

/** Brief 25 A4: the people to choose from. */
export async function listPeopleForAccessCheck(db: D1Database, ctx: RequestContext) {
  await requireCapability(db, ctx);
  return listPeopleNames(db);
}

/**
 * Brief 25 A4: exactly which capabilities and scopes a person has, and the
 * current terms they come through. Permissions only, never their data; no
 * impersonation — nothing here acts as them.
 */
export async function checkAccess(
  db: D1Database,
  ctx: RequestContext,
  personId: string,
): Promise<AccessCheck> {
  await requireCapability(db, ctx);
  const person = (await listPeopleNames(db)).find((p) => p.personId === personId);
  if (!person) throw new NotFoundError('access-check.person-not-found');
  const [admin, currentTerms, grants] = await Promise.all([
    isSystemAdministrator(db, personId),
    listCurrentTermsOf(db, personId, getTodayInLondon()),
    describeAccess(db, personId),
  ]);
  return { ...person, isSystemAdministrator: admin, currentTerms, grants };
}
