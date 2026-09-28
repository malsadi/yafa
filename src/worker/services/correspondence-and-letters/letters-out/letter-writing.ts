import type { WritingChoices } from '../../../../shared/correspondence-and-letters/letter-records';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { usableLetterTemplates } from '../../resources-library';
import { signerRolesOf } from './letters-out.repo';

type Template = WritingChoices['templates'][number];

/** O-141: one of the templates the unit may write from. */
export async function requireUsableTemplate(
  db: D1Database,
  unitId: string,
  templateId: string,
): Promise<Template> {
  const template = (await usableLetterTemplates(db, unitId)).find((t) => t.id === templateId);
  if (!template) throw new NotFoundError('correspondence-and-letters.template-not-found');
  return template;
}

/** O-139: every field the template names, filled in — and only those. */
export function requireFilledFields(
  template: Template,
  values: Readonly<Record<string, string>>,
): Record<string, string> {
  const filled: Record<string, string> = {};
  for (const field of template.fields) {
    const value = values[field]?.trim();
    if (!value) throw new ConflictError('correspondence-and-letters.field-missing');
    filled[field] = value;
  }
  return filled;
}

/** The template's fields as written so far, for a preview (O-142). */
export function previewFields(
  template: Template,
  values: Readonly<Record<string, string>>,
): Record<string, string> {
  return Object.fromEntries(template.fields.map((field) => [field, values[field] ?? '']));
}

/** O-140: the writer signs, in one of the roles they hold in the unit today. */
export async function requireSigner(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; roleId: string },
): Promise<{ name: string; roleId: string; roleNameEn: string; roleNameAr: string }> {
  const roles = await signerRolesOf(db, {
    personId: ctx.personId,
    unitId: params.unitId,
    today: getTodayInLondon(),
  });
  const role = roles.find((r) => r.roleId === params.roleId);
  if (!role) throw new ConflictError('correspondence-and-letters.not-your-role');
  return {
    name: await personName(db, ctx.personId),
    roleId: role.roleId,
    roleNameEn: role.nameEn,
    roleNameAr: role.nameAr,
  };
}

export async function personName(db: D1Database, personId: string): Promise<string> {
  const row = await db
    .prepare('SELECT name FROM people WHERE id = ?')
    .bind(personId)
    .first<{ name: string }>();
  return row?.name ?? '';
}
