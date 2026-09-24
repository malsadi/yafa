import type { ClerkAccounts } from '../../../clerk';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import {
  requireCapability,
  requireRegisterReader,
  requireWritableUnit,
} from '../committee-register-guards';
import { inviteIfNeeded, type InvitationOutcome } from '../invitations/invitations.service';
import { listRoles } from '../roles/roles.repo';
import { buildInsertPersonStatement, buildInsertTermStatement } from './officers-statements.repo';
import { newPersonLanguage } from './new-person-language';
import { findPersonByEmail, listEndedTerms, listUnendedTerms } from './officers.repo';
import type { AddOfficerInput, OfficerRecord } from './officers.schema';

const MANAGE = 'committee-register.officers.manage';

/** Brief 14 B1: a unit's officers, current and upcoming. */
export async function listOfficers(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<OfficerRecord[]> {
  await requireRegisterReader(db, ctx, unitId);
  return listUnendedTerms(db, unitId, getTodayInLondon());
}

/** Brief 14 C3: a unit's past officers, kept as its history. */
export async function listPastOfficers(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<OfficerRecord[]> {
  await requireRegisterReader(db, ctx, unitId);
  return listEndedTerms(db, unitId, getTodayInLondon());
}

async function checkNewTerm(
  db: D1Database,
  unitId: string,
  input: AddOfficerInput,
  personId: string | null,
) {
  if (!(await listRoles(db, unitId)).some((role) => role.id === input.roleId)) {
    throw new NotFoundError('roles.not-found');
  }
  const unended = await listUnendedTerms(db, unitId, getTodayInLondon());
  if (personId && unended.some((t) => t.personId === personId && t.roleId === input.roleId)) {
    throw new ConflictError('officers.already-holds-role');
  }
}

/**
 * Brief 14 B1 and P5: add an officer to a unit with a term of office. A
 * known email adds a term to that same person; a new person starts in the
 * language the administrator has set (brief 8.5) — until then, this waits.
 * Then invites them to sign in, unless they have an account already.
 */
export async function addOfficer(
  db: D1Database,
  clerk: ClerkAccounts,
  ctx: RequestContext,
  params: { unitId: string; input: AddOfficerInput },
): Promise<{ personId: string; termId: string; invitation: InvitationOutcome }> {
  const { unitId, input } = params;
  await requireCapability(db, ctx, MANAGE, { unitId });
  await requireWritableUnit(db, unitId);
  const existing = await findPersonByEmail(db, input.email);
  await checkNewTerm(db, unitId, input, existing?.id ?? null);
  const personId = existing?.id ?? generateId();
  const person = existing
    ? []
    : [
        buildInsertPersonStatement(db, {
          id: personId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          language: await newPersonLanguage(db),
        }),
      ];
  const term = {
    id: generateId(),
    personId,
    roleId: input.roleId,
    unitId,
    startDate: input.startDate,
    endDate: input.endDate ?? null,
  };
  await db.batch([
    ...person,
    buildInsertTermStatement(db, term),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'officer.added',
      entityType: 'term',
      entityId: term.id,
      after: { ...term, newPerson: !existing },
    }),
  ]);
  // Brief 6.2: adding an officer sends their invitation (after the batch).
  const invitation = await inviteIfNeeded(db, clerk, { personId, actorPersonId: ctx.personId });
  return { personId, termId: term.id, invitation };
}
