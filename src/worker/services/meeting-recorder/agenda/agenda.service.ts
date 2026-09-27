import { MeetingStatus } from '../../../../shared/meeting-recorder/meeting-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { requireChairSecretaryOrManager } from '../chair-or-secretary';
import { requireMeetingCapability, requireWritable, runMeetingBatch } from '../meeting-access';
import { requireUnitMeeting } from '../meetings/meeting-guards';
import { MANAGE } from '../meetings/meetings.service';
import {
  buildAddItemStatement,
  buildChangeItemStatement,
  buildOrderStatements,
  findAgendaItem,
} from './agenda.repo';
import type { AgendaItemInput } from './agenda.schema';

interface MeetingRef {
  unitId: string;
  meetingId: string;
}

/**
 * D-204: before the meeting, those who manage meetings set the agenda;
 * while it is held, its chair, secretary or a manager add points raised in
 * it. The database refuses anything else.
 */
async function requireAgendaChange(db: D1Database, ctx: RequestContext, params: MeetingRef) {
  const scheduled = await requireUnitMeeting(db, params.unitId, params.meetingId);
  if (scheduled.status === MeetingStatus.Scheduled) {
    requireWritable(await requireMeetingCapability(db, ctx, MANAGE, params.unitId));
    return { meeting: scheduled, raised: false };
  }
  const meeting = await requireChairSecretaryOrManager(db, ctx, params);
  if (meeting.status !== MeetingStatus.Held) throw new ConflictError('meeting-recorder.locked');
  return { meeting, raised: true };
}

async function requireItem(db: D1Database, meetingId: string, itemId: string) {
  const item = await findAgendaItem(db, itemId);
  if (item?.meetingId !== meetingId) throw new NotFoundError('meeting-recorder.item-not-found');
  return item;
}

const audit = (db: D1Database, actor: string, meetingId: string, action: string, after: object) =>
  buildAuditStatement(db, {
    actorPersonId: actor,
    action,
    entityType: 'meeting',
    entityId: meetingId,
    after,
  });

/** Brief 22 A3: an item added — "raised in meeting" if the meeting is held. */
export async function addAgendaItem(
  db: D1Database,
  ctx: RequestContext,
  params: MeetingRef & { item: AgendaItemInput },
): Promise<{ id: string }> {
  const { meeting, raised } = await requireAgendaChange(db, ctx, params);
  const at = new Date().toISOString();
  const added = buildAddItemStatement(db, {
    ...params.item,
    meetingId: meeting.id,
    raised,
    actor: ctx.personId,
    at,
  });
  await runMeetingBatch(db, [
    added.statement,
    audit(db, ctx.personId, meeting.id, 'meeting.agenda-item-added', { ...params.item, raised }),
  ]);
  return { id: added.id };
}

/** D-204: an item changed — any before the meeting; only one raised in it once held. */
export async function changeAgendaItem(
  db: D1Database,
  ctx: RequestContext,
  params: MeetingRef & { itemId: string; version: number; item: AgendaItemInput },
): Promise<void> {
  const { meeting, raised } = await requireAgendaChange(db, ctx, params);
  const item = await requireItem(db, meeting.id, params.itemId);
  if (raised && item.raisedInMeeting === 0)
    throw new ConflictError('meeting-recorder.original-agenda-fixed');
  const at = new Date().toISOString();
  await runMeetingBatch(db, [
    buildChangeItemStatement(db, {
      ...params.item,
      id: item.id,
      version: params.version,
      actor: ctx.personId,
      at,
    }),
    audit(db, ctx.personId, meeting.id, 'meeting.agenda-item-changed', {
      itemId: item.id,
      ...params.item,
    }),
  ]);
}

/** D-204: before the meeting only, an item removed, or the agenda put in order. */
async function requireScheduledManager(db: D1Database, ctx: RequestContext, params: MeetingRef) {
  requireWritable(await requireMeetingCapability(db, ctx, MANAGE, params.unitId));
  const meeting = await requireUnitMeeting(db, params.unitId, params.meetingId);
  if (meeting.status !== MeetingStatus.Scheduled)
    throw new ConflictError('meeting-recorder.original-agenda-fixed');
  return meeting;
}

export async function removeAgendaItem(
  db: D1Database,
  ctx: RequestContext,
  params: MeetingRef & { itemId: string },
): Promise<void> {
  const meeting = await requireScheduledManager(db, ctx, params);
  const item = await requireItem(db, meeting.id, params.itemId);
  await runMeetingBatch(db, [
    db.prepare('DELETE FROM agenda_items WHERE id = ?').bind(item.id),
    audit(db, ctx.personId, meeting.id, 'meeting.agenda-item-removed', { itemId: item.id }),
  ]);
}

export async function orderAgenda(
  db: D1Database,
  ctx: RequestContext,
  params: MeetingRef & { itemIds: string[] },
): Promise<void> {
  const meeting = await requireScheduledManager(db, ctx, params);
  const { results } = await db
    .prepare('SELECT id FROM agenda_items WHERE meeting_id = ?')
    .bind(meeting.id)
    .all<{ id: string }>();
  const current = new Set(results.map((r) => r.id));
  if (params.itemIds.length !== current.size || params.itemIds.some((id) => !current.has(id)))
    throw new ConflictError('meeting-recorder.agenda-changed');
  const at = new Date().toISOString();
  await runMeetingBatch(db, [
    ...buildOrderStatements(db, { itemIds: params.itemIds, actor: ctx.personId, at }),
    audit(db, ctx.personId, meeting.id, 'meeting.agenda-ordered', { itemIds: params.itemIds }),
  ]);
}
