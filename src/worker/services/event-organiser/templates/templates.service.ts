import type { EventTemplateRecord } from '../../../../shared/event-organiser/event-records';
import { buildAuditStatement } from '../../../core/audit';
import { NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { listUnits } from '../../committee-register';
import { requireEventCapability, requireWritable, runEventBatch } from '../event-access';
import {
  buildInsertTemplateStatement,
  buildTemplateContentStatements,
  buildUpdateTemplateStatement,
  findTemplate,
  listTemplates,
} from './templates.repo';
import type { TemplateInput } from './templates.schema';

export const MANAGE_TEMPLATES = 'event-organiser.templates.manage';
export const CREATE = 'event-organiser.events.create';

/** P15 and D-178: a unit's own templates and the General Council's national ones. */
async function unitAndNational(db: D1Database, unitId: string): Promise<string[]> {
  const national = (await listUnits(db)).filter((u) => u.type === 'national').map((u) => u.id);
  return [...new Set([unitId, ...national])];
}

/** D-178: the unit's own templates, retired ones too, for those who manage them. */
export async function unitTemplates(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<EventTemplateRecord[]> {
  await requireEventCapability(db, ctx, MANAGE_TEMPLATES, unitId);
  return listTemplates(db, [unitId]);
}

/** Brief 21 A3 and D-178: the templates an event may start from — the unit's and the national ones, not retired. */
export async function templateChoices(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<EventTemplateRecord[]> {
  await requireEventCapability(db, ctx, CREATE, unitId);
  const templates = await listTemplates(db, await unitAndNational(db, unitId));
  return templates.filter((t) => t.retiredAt === null);
}

/** A template an event of this unit may start from: its own or a national one, not retired. */
export async function requireTemplateChoice(
  db: D1Database,
  unitId: string,
  templateId: string,
): Promise<EventTemplateRecord> {
  const template = await findTemplate(db, templateId);
  const allowed = await unitAndNational(db, unitId);
  if (!template) throw new NotFoundError('event-organiser.template-not-found');
  if (template.retiredAt !== null || !allowed.includes(template.unitId))
    throw new NotFoundError('event-organiser.template-not-found');
  return template;
}

export async function addTemplate(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  template: TemplateInput,
): Promise<{ id: string }> {
  requireWritable(await requireEventCapability(db, ctx, MANAGE_TEMPLATES, unitId));
  const id = generateId();
  const at = new Date().toISOString();
  await runEventBatch(db, [
    buildInsertTemplateStatement(db, { id, unitId, name: template.name, actor: ctx.personId, at }),
    ...buildTemplateContentStatements(db, id, template),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'event-template.added',
      entityType: 'event-template',
      entityId: id,
      after: template,
    }),
  ]);
  return { id };
}

async function requireUnitTemplate(
  db: D1Database,
  unitId: string,
  id: string,
): Promise<EventTemplateRecord> {
  const template = await findTemplate(db, id);
  if (template?.unitId !== unitId) throw new NotFoundError('event-organiser.template-not-found');
  return template;
}

/** D-178: a changed template; events already created from it keep what they were given. */
export async function changeTemplate(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; id: string; version: number; template: TemplateInput },
): Promise<void> {
  requireWritable(await requireEventCapability(db, ctx, MANAGE_TEMPLATES, params.unitId));
  const before = await requireUnitTemplate(db, params.unitId, params.id);
  const at = new Date().toISOString();
  await runEventBatch(db, [
    buildUpdateTemplateStatement(db, {
      id: before.id,
      name: params.template.name,
      retiredAt: before.retiredAt,
      version: params.version,
      actor: ctx.personId,
      at,
    }),
    ...buildTemplateContentStatements(db, before.id, params.template),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'event-template.changed',
      entityType: 'event-template',
      entityId: before.id,
      before: { name: before.name, tasks: before.tasks, budgetLines: before.budgetLines },
      after: params.template,
    }),
  ]);
}

/** A template retired from new events, or brought back; never deleted. */
export async function setTemplateRetired(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; id: string; version: number; retire: boolean },
): Promise<void> {
  requireWritable(await requireEventCapability(db, ctx, MANAGE_TEMPLATES, params.unitId));
  const before = await requireUnitTemplate(db, params.unitId, params.id);
  const at = new Date().toISOString();
  await runEventBatch(db, [
    buildUpdateTemplateStatement(db, {
      id: before.id,
      name: before.name,
      retiredAt: params.retire ? at : null,
      version: params.version,
      actor: ctx.personId,
      at,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: params.retire ? 'event-template.retired' : 'event-template.restored',
      entityType: 'event-template',
      entityId: before.id,
    }),
  ]);
}
