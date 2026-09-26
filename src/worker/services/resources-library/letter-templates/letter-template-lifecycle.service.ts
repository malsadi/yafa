import { buildAuditStatement } from '../../../core/audit';
import { ConflictError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { requireManagedTemplate, runTemplateBatch } from './letter-template-guards';
import { buildUpdateTemplateStatement } from './letter-templates.repo';

interface Params {
  unitId: string;
  templateId: string;
  version: number;
}

async function setRetired(db: D1Database, ctx: RequestContext, params: Params, retire: boolean) {
  const before = await requireManagedTemplate(db, ctx, params);
  if (retire === Boolean(before.retiredAt)) {
    throw new ConflictError(
      retire ? 'resources-library.already-retired' : 'resources-library.not-retired',
    );
  }
  const at = new Date().toISOString();
  await runTemplateBatch(db, [
    buildUpdateTemplateStatement(db, {
      id: before.id,
      version: params.version,
      actor: ctx.personId,
      at,
      retiredAt: retire ? at : null,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: retire ? 'letter-template.retired' : 'letter-template.restored',
      entityType: 'letter-template',
      entityId: before.id,
      before,
    }),
  ]);
}

/** D-100: retire a template. It is kept, never deleted, and no longer offered. */
export function retireLetterTemplate(db: D1Database, ctx: RequestContext, params: Params) {
  return setRetired(db, ctx, params, true);
}

/** D-100: bring a retired template back. */
export function restoreLetterTemplate(db: D1Database, ctx: RequestContext, params: Params) {
  return setRetired(db, ctx, params, false);
}
