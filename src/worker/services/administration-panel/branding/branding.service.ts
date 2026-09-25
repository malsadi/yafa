import type { Branding } from '../../../../shared/administration-panel/branding';
import { ForbiddenError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { getSetting, setSetting } from '../../../core/settings';

const CAPABILITY = 'administration-panel.branding.manage';
const KEYS = {
  organisationName: 'administration-panel.organisation_name',
  mainColour: 'administration-panel.main_colour',
  accentColour: 'administration-panel.accent_colour',
} as const;

async function configured<Value>(db: D1Database, key: string): Promise<Value | null> {
  const setting = await getSetting<Value>(db, key);
  return setting.status === 'configured' ? setting.value : null;
}

/** Brief 25 C3 and D-082: the branding as set, for the PDFs and every officer's screens. */
export async function readBranding(db: D1Database): Promise<Branding> {
  const [organisationName, mainColour, accentColour] = await Promise.all([
    configured<Branding['organisationName']>(db, KEYS.organisationName),
    configured<string>(db, KEYS.mainColour),
    configured<string>(db, KEYS.accentColour),
  ]);
  return { organisationName, mainColour, accentColour };
}

/**
 * Brief 25 C3: set the organisation name and the colours, each through the
 * settings registry, so each is checked by its own schema (a colour must
 * read on white, D-082) and keeps its history. Only the parts sent change.
 */
export async function setBranding(
  db: D1Database,
  ctx: RequestContext,
  changes: Partial<Record<keyof typeof KEYS, unknown>>,
): Promise<Branding> {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
  for (const [part, key] of Object.entries(KEYS) as [keyof typeof KEYS, string][]) {
    if (changes[part] !== undefined) {
      await setSetting(db, { key, value: changes[part], actorPersonId: ctx.personId });
    }
  }
  return readBranding(db);
}
