import type {
  LetterTemplateRecord,
  LetterTemplatesView,
} from '../../../../shared/resources-library/letter-template';
import { buildAuditStatement } from '../../../core/audit';
import { generateId } from '../../../core/ids';
import { can, type RequestContext } from '../../../core/permissions';
import { listUnits } from '../../committee-register';
import { requireLibraryCapability, requireWritable, sharedWith } from '../library-access';
import { MANAGE, requireManagedTemplate, runTemplateBatch } from './letter-template-guards';
import {
  buildInsertTemplateStatement,
  buildUpdateTemplateStatement,
  listTemplatesOf,
} from './letter-templates.repo';
import type { LetterTemplateInput } from './letter-templates.schema';

const READ = 'resources-library.library.read';

/**
 * Brief 16 D1 and 7.3: a unit's letter templates and the General Council's.
 * A retired one (D-100) is listed only to whoever manages its unit's, to
 * bring it back. With the unit's letterhead details, for the preview (D-102).
 */
export async function listLetterTemplates(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<LetterTemplatesView> {
  const unit = await requireLibraryCapability(db, ctx, READ, unitId);
  const unitIds = await sharedWith(db, unit);
  const national = new Set(
    (await listUnits(db)).filter((u) => u.type === 'national').map((u) => u.id),
  );
  const manages = new Map<string, boolean>();
  for (const id of unitIds) manages.set(id, await can(db, ctx, MANAGE, { unitId: id }));
  const templates: LetterTemplateRecord[] = (await listTemplatesOf(db, unitIds))
    .filter((t) => !t.retiredAt || manages.get(t.unitId))
    .map((t) => ({ ...t, national: national.has(t.unitId) }));
  return {
    templates,
    letterheadUnit: {
      nameEn: unit.nameEn,
      nameAr: unit.nameAr,
      addressEn: unit.letterheadAddressEn,
      addressAr: unit.letterheadAddressAr,
    },
  };
}

/** Brief 16 D1 and P19: write a new template for the unit. */
export async function createLetterTemplate(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  input: LetterTemplateInput,
): Promise<{ id: string }> {
  requireWritable(await requireLibraryCapability(db, ctx, MANAGE, unitId));
  const row = {
    ...input,
    id: generateId(),
    unitId,
    actor: ctx.personId,
    at: new Date().toISOString(),
  };
  await db.batch([
    buildInsertTemplateStatement(db, row),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'letter-template.created',
      entityType: 'letter-template',
      entityId: row.id,
      after: input,
    }),
  ]);
  return { id: row.id };
}

/** Brief 16 D1 and P19: change a template, from the version the author read (9.1). */
export async function updateLetterTemplate(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; templateId: string; version: number; template: LetterTemplateInput },
): Promise<void> {
  const before = await requireManagedTemplate(db, ctx, params);
  await runTemplateBatch(db, [
    buildUpdateTemplateStatement(db, {
      id: before.id,
      version: params.version,
      actor: ctx.personId,
      at: new Date().toISOString(),
      template: params.template,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'letter-template.changed',
      entityType: 'letter-template',
      entityId: before.id,
      before,
      after: params.template,
    }),
  ]);
}
