import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import {
  can,
  findCurrentTerms,
  getTodayInLondon,
  isNationalUnit,
  isSystemAdministrator,
  type RequestContext,
} from '../../../core/permissions';
import {
  buildAppointStatement,
  buildRemoveStatement,
  countSystemAdministrators,
  listSystemAdministrators,
} from './system-administrators.repo';
import type { SystemAdministratorListItem } from './system-administrators.schema';

const CAPABILITY = 'administration-panel.system-administrators.manage';
// P21 (D-042): at least two always remain. A rule of the brief, not a setting.
const MINIMUM_SYSTEM_ADMINISTRATORS = 2;

async function requireCapability(db: D1Database, ctx: RequestContext): Promise<void> {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
}

async function holdsGeneralCouncilTerm(db: D1Database, personId: string): Promise<boolean> {
  const terms = await findCurrentTerms(db, personId, getTodayInLondon());
  const national = await Promise.all(terms.map((term) => isNationalUnit(db, term.unitId)));
  return national.some(Boolean);
}

/** Brief 25 A1: the system administrators, oldest appointment first. */
export async function listAdministrators(
  db: D1Database,
  ctx: RequestContext,
): Promise<SystemAdministratorListItem[]> {
  await requireCapability(db, ctx);
  return listSystemAdministrators(db);
}

/** Brief 25 A1: appoint someone holding a current General Council term. */
export async function appointAdministrator(
  db: D1Database,
  ctx: RequestContext,
  personId: string,
): Promise<void> {
  await requireCapability(db, ctx);
  if (await isSystemAdministrator(db, personId)) {
    throw new ConflictError('system-administrators.already-appointed');
  }
  if (!(await holdsGeneralCouncilTerm(db, personId))) {
    throw new ConflictError('system-administrators.needs-general-council-term');
  }
  await db.batch([
    buildAppointStatement(db, personId),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'system-administrator.appointed',
      entityType: 'system_administrator',
      entityId: personId,
      after: { personId },
    }),
  ]);
}

/** Brief 25 A1 and P21: remove one, never leaving fewer than two. */
export async function removeAdministrator(
  db: D1Database,
  ctx: RequestContext,
  personId: string,
): Promise<void> {
  await requireCapability(db, ctx);
  if (!(await isSystemAdministrator(db, personId))) {
    throw new NotFoundError('system-administrators.not-found');
  }
  if ((await countSystemAdministrators(db)) <= MINIMUM_SYSTEM_ADMINISTRATORS) {
    throw new ConflictError('system-administrators.minimum-two');
  }
  await db.batch([
    buildRemoveStatement(db, personId),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'system-administrator.removed',
      entityType: 'system_administrator',
      entityId: personId,
      before: { personId },
    }),
  ]);
}
