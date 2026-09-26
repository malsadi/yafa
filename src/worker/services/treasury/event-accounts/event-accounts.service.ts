import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import { getTodayInLondon } from '../../../core/permissions';
import { buildCloseAccountStatement, findAccount } from '../accounts/accounts.repo';
import {
  buildBudgetLineStatement,
  buildClosingTransferStatements,
  buildOpenEventAccountStatement,
} from './event-accounts.repo';

/**
 * Brief 17 A2, 10 ("Event created") and D-131: an event's account and its
 * budget lines, as statements for the Event organiser's own batch. The
 * Treasury's API never does this itself (17's rules).
 */
export function openEventAccount(
  db: D1Database,
  params: {
    unitId: string;
    eventId: string;
    name: string;
    budgetLines: { name: string; amountPence: number }[];
    actor: string;
  },
): { accountId: string; statements: D1PreparedStatement[] } {
  const accountId = generateId();
  const at = new Date().toISOString();
  return {
    accountId,
    statements: [
      buildOpenEventAccountStatement(db, {
        id: accountId,
        unitId: params.unitId,
        eventId: params.eventId,
        name: params.name,
        actor: params.actor,
        at,
      }),
      ...params.budgetLines.map((line, index) =>
        buildBudgetLineStatement(db, {
          accountId,
          unitId: params.unitId,
          ...line,
          position: index + 1,
        }),
      ),
    ],
  };
}

/**
 * Brief 17 A2, 10 ("Event closed"), P8 and D-131: close an event's account
 * — its balance moved to one of the unit's open branch accounts, or an
 * overspend brought to zero from it — as statements for the Event
 * organiser's batch. Returns the balance now, so the close can warn first.
 */
export async function closeEventAccount(
  db: D1Database,
  params: { eventId: string; branchAccountId: string; description: string | null; actor: string },
): Promise<{ balancePence: number; statements: D1PreparedStatement[] }> {
  const row = await db
    .prepare("SELECT id FROM treasury_accounts WHERE event_id = ? AND kind = 'event'")
    .bind(params.eventId)
    .first<{ id: string }>();
  const event = row ? await findAccount(db, row.id) : null;
  if (!event) throw new NotFoundError('treasury.account-not-found');
  if (event.status === 'Closed') throw new ConflictError('treasury.account-closed');
  const branch = await findAccount(db, params.branchAccountId);
  if (branch?.unitId !== event.unitId || branch.kind !== 'branch' || branch.status !== 'Open') {
    throw new ConflictError('treasury.not-an-open-branch-account');
  }
  const at = new Date().toISOString();
  const transfer = {
    eventAccountId: event.id,
    branchAccountId: branch.id,
    unitId: event.unitId,
    date: getTodayInLondon(),
    description: params.description,
    actor: params.actor,
    at,
  };
  return {
    balancePence: event.balancePence,
    statements: [
      ...buildClosingTransferStatements(db, transfer),
      buildCloseAccountStatement(db, { accountId: event.id, actor: params.actor, at }),
    ],
  };
}
