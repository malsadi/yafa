import { addDaysToDate } from '../../../../shared/core/add-days-to-date';
import type { EventSummary } from '../../../../shared/event-organiser/event-records';
import { buildAuditStatement } from '../../../core/audit';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { buildCalendarEntryStatement } from '../../calendar';
import { buildEventTaskStatements } from '../../task-tracker';
import { openEventAccount } from '../../treasury';
import { requireEventCapability, requireWritable, runEventBatch } from '../event-access';
import { calendarEntry } from '../publishing/calendar-entry';
import { CREATE, requireTemplateChoice } from '../templates/templates.service';
import {
  requireEventType,
  requireLeadOfficer,
  requireNotClosed,
  requireUnitEvent,
} from './event-guards';
import {
  buildInsertEventStatement,
  buildUpdateEventDetailsStatement,
  listUnitEvents,
} from './events.repo';
import type { EventInput } from './events.schema';

export const READ = 'event-organiser.events.read';
export const MANAGE = 'event-organiser.events.manage';

/** D-173: the unit's events, for its own officers who see them. */
export async function unitEvents(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<EventSummary[]> {
  await requireEventCapability(db, ctx, READ, unitId);
  return listUnitEvents(db, unitId);
}

export async function oneEvent(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; eventId: string },
): Promise<EventSummary> {
  await requireEventCapability(db, ctx, READ, params.unitId);
  return requireUnitEvent(db, params.unitId, params.eventId);
}

/** D-178: a template's default tasks, due the set days before the first day, owned by the lead officer. */
async function templateDefaults(
  db: D1Database,
  unitId: string,
  templateId: string | null,
  event: EventInput,
) {
  if (templateId === null) return { tasks: [], budgetLines: [] };
  const template = await requireTemplateChoice(db, unitId, templateId);
  return {
    tasks: template.tasks.map((task) => ({
      title: task.title,
      description: task.description,
      ownerPersonId: event.leadPersonId,
      dueDate: addDaysToDate(event.firstDay, -task.daysBefore),
    })),
    budgetLines: template.budgetLines,
  };
}

/**
 * Brief 21 A1, A3 and 10.1 ("Event created"): the event, in Draft, with its
 * Treasury account and budget lines and its task list, from the template's
 * defaults if one is chosen — all in one batch.
 */
export async function createEvent(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  input: { event: EventInput; templateId: string | null },
): Promise<{ id: string }> {
  requireWritable(await requireEventCapability(db, ctx, CREATE, unitId));
  await requireEventType(db, input.event.typeItemId);
  await requireLeadOfficer(db, unitId, input.event.leadPersonId);
  const defaults = await templateDefaults(db, unitId, input.templateId, input.event);
  const id = generateId();
  const at = new Date().toISOString();
  const account = openEventAccount(db, {
    unitId,
    eventId: id,
    name: input.event.name,
    budgetLines: defaults.budgetLines,
    actor: ctx.personId,
  });
  const tasks = buildEventTaskStatements(db, {
    unitId,
    eventId: id,
    tasks: defaults.tasks,
    actor: ctx.personId,
    at,
  });
  await runEventBatch(db, [
    buildInsertEventStatement(db, {
      ...input.event,
      id,
      unitId,
      templateId: input.templateId,
      actor: ctx.personId,
      at,
    }),
    ...account.statements,
    ...tasks.statements,
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'event.created',
      entityType: 'event',
      entityId: id,
      after: { ...input.event, templateId: input.templateId },
    }),
  ]);
  return { id };
}

/** D-176: the name, type, dates and lead officer change until the event is closed. */
export async function changeEventDetails(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; eventId: string; version: number; event: EventInput },
): Promise<void> {
  requireWritable(await requireEventCapability(db, ctx, MANAGE, params.unitId));
  const before = await requireUnitEvent(db, params.unitId, params.eventId);
  requireNotClosed(before);
  await requireEventType(db, params.event.typeItemId, before.typeItemId);
  await requireLeadOfficer(db, params.unitId, params.event.leadPersonId, before.leadPersonId);
  const at = new Date().toISOString();
  await runEventBatch(db, [
    buildUpdateEventDetailsStatement(db, {
      ...params.event,
      id: before.id,
      version: params.version,
      actor: ctx.personId,
      at,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'event.changed',
      entityType: 'event',
      entityId: before.id,
      before: {
        name: before.name,
        typeItemId: before.typeItemId,
        leadPersonId: before.leadPersonId,
        firstDay: before.firstDay,
        startTime: before.startTime,
        lastDay: before.lastDay,
      },
      after: params.event,
    }),
    // D-176: once published, the Calendar entry follows in the same batch; no second notice.
    ...(before.calendarPublishedAt === null
      ? []
      : [
          buildCalendarEntryStatement(
            db,
            calendarEntry({ ...params.event, id: before.id, unitId: before.unitId }),
          ),
        ]),
  ]);
}
