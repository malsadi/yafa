import { EventStatus } from '../../../../shared/event-organiser/event-statuses';
import type {
  AccountHistory,
  EventBudgetFigures,
} from '../../../../shared/treasury/treasury-records';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import {
  buildAddEventBudgetLineStatement,
  buildChangeEventBudgetLineStatement,
  buildRemoveEventBudgetLineStatement,
  eventAccountHistory,
  eventBudgetFigures,
  findEventBudgetLine,
} from '../../treasury';
import { requireEventCapability, requireWritable, runEventBatch } from '../event-access';
import { requireUnitEvent } from '../events/event-guards';
import { MANAGE, READ } from '../events/events.service';

interface EventRef {
  unitId: string;
  eventId: string;
}

/** Brief 21 A2 and D-177: the event's budget lines, income, spending, balance and receipts — the Treasury's own figures. */
export async function eventAccount(
  db: D1Database,
  ctx: RequestContext,
  params: EventRef,
): Promise<AccountHistory & { figures: EventBudgetFigures }> {
  await requireEventCapability(db, ctx, READ, params.unitId);
  await requireUnitEvent(db, params.unitId, params.eventId);
  const [history, figures] = await Promise.all([
    eventAccountHistory(db, params.eventId),
    eventBudgetFigures(db, params.eventId),
  ]);
  return { ...history, figures };
}

/** D-176: budget lines change only in Draft, by those who manage events. */
async function requireDraft(db: D1Database, ctx: RequestContext, params: EventRef) {
  requireWritable(await requireEventCapability(db, ctx, MANAGE, params.unitId));
  const event = await requireUnitEvent(db, params.unitId, params.eventId);
  if (event.status !== EventStatus.Draft) throw new ConflictError('event-organiser.budget-fixed');
}

const audit = (db: D1Database, actor: string, eventId: string, action: string, after: object) =>
  buildAuditStatement(db, {
    actorPersonId: actor,
    action,
    entityType: 'event',
    entityId: eventId,
    after,
  });

export async function addBudgetLine(
  db: D1Database,
  ctx: RequestContext,
  params: EventRef & { line: { name: string; amountPence: number } },
): Promise<void> {
  await requireDraft(db, ctx, params);
  await runEventBatch(db, [
    buildAddEventBudgetLineStatement(db, { eventId: params.eventId, ...params.line }),
    audit(db, ctx.personId, params.eventId, 'event.budget-line-added', params.line),
  ]);
}

export async function changeBudgetLine(
  db: D1Database,
  ctx: RequestContext,
  params: EventRef & { lineId: string; line: { name: string; amountPence: number } },
): Promise<void> {
  await requireDraft(db, ctx, params);
  if (!(await findEventBudgetLine(db, params)))
    throw new NotFoundError('event-organiser.budget-line-not-found');
  await runEventBatch(db, [
    buildChangeEventBudgetLineStatement(db, { ...params, ...params.line }),
    audit(db, ctx.personId, params.eventId, 'event.budget-line-changed', {
      lineId: params.lineId,
      ...params.line,
    }),
  ]);
}

/** D-187: removed only in Draft, and never once an entry is tagged to it. */
export async function removeBudgetLine(
  db: D1Database,
  ctx: RequestContext,
  params: EventRef & { lineId: string },
): Promise<void> {
  await requireDraft(db, ctx, params);
  const line = await findEventBudgetLine(db, params);
  if (!line) throw new NotFoundError('event-organiser.budget-line-not-found');
  if (line.tagged > 0) throw new ConflictError('event-organiser.budget-line-tagged');
  await runEventBatch(db, [
    buildRemoveEventBudgetLineStatement(db, params),
    audit(db, ctx.personId, params.eventId, 'event.budget-line-removed', { lineId: params.lineId }),
  ]);
}
