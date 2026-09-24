import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import { can, getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { requireCapability, requireWritableUnit } from '../committee-register-guards';
import { buildEndTermStatement, buildUpdatePersonStatement } from './officers-statements.repo';
import { findPerson, findTerm, listPersonUnitIds } from './officers.repo';
import type { UpdatePersonInput } from './officers.schema';

const MANAGE = 'committee-register.officers.manage';

/**
 * Brief 14 B1: correct a person's name or phone. Allowed to whoever
 * manages the register of any unit they have held a term in. The email
 * changes only through Clerk's sync (brief 6.2), so it can't drift.
 */
export async function updatePerson(
  db: D1Database,
  ctx: RequestContext,
  personId: string,
  changes: UpdatePersonInput,
): Promise<void> {
  const person = await findPerson(db, personId);
  const unitIds = person ? await listPersonUnitIds(db, personId) : [];
  const allowed = await Promise.all(unitIds.map((unitId) => can(db, ctx, MANAGE, { unitId })));
  if (!person || !allowed.some(Boolean)) {
    throw new ForbiddenError('permission.denied');
  }
  const after = { ...person, ...changes };
  await db.batch([
    buildUpdatePersonStatement(db, after),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'person.changed',
      entityType: 'person',
      entityId: personId,
      before: { name: person.name, phone: person.phone },
      after: { name: after.name, phone: after.phone },
    }),
  ]);
}

/**
 * Brief 14 B3 and C3: end a term. Only a term not yet ended; once ended it
 * is history and never changes or disappears. Powers end on the end date
 * (D-019).
 */
export async function endTerm(
  db: D1Database,
  ctx: RequestContext,
  termId: string,
  endDate: string,
): Promise<void> {
  const term = await findTerm(db, termId);
  if (!term) {
    throw new NotFoundError('terms.not-found');
  }
  await requireCapability(db, ctx, MANAGE, { unitId: term.unitId });
  await requireWritableUnit(db, term.unitId);
  const today = getTodayInLondon();
  if (term.endDate !== null && term.endDate <= today) {
    throw new ConflictError('terms.already-ended');
  }
  if (endDate <= term.startDate) {
    throw new ConflictError('terms.end-before-start');
  }
  await db.batch([
    buildEndTermStatement(db, termId, endDate, today),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'term.ended',
      entityType: 'term',
      entityId: termId,
      before: { endDate: term.endDate },
      after: { endDate },
    }),
  ]);
}
