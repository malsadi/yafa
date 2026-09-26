import type { BrowserWorker } from '@cloudflare/puppeteer';
import { LOGO_POSITIONS } from '../../../../shared/administration-panel/branding-files';
import { LANGUAGES } from '../../../../shared/core/languages';
import { ConflictError, ForbiddenError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { listUnits } from '../../committee-register';
import { z } from 'zod';
import { renderOnLetterhead } from './render-on-letterhead';

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

/** What the screen sends: the draft being edited, and the sample letter in the officer's words. */
export const letterheadPreviewSchema = z.object({
  language: z.enum(LANGUAGES),
  draft: z.object({
    organisationName: z.string().min(1),
    mainColour: hex,
    accentColour: hex,
    logoPosition: z.enum(LOGO_POSITIONS),
  }),
  letter: z.object({
    paragraphs: z.array(z.string()),
    signer: z.object({ name: z.string(), role: z.string(), unit: z.string() }),
  }),
  logoPlaceholder: z.string(),
});

/**
 * D-090: the letterhead as a PDF, only when "Preview" is pressed — one
 * Browser Rendering call. The draft being edited, the real logo and fonts,
 * and the General Council's letterhead address (the branding's unit).
 */
export async function renderLetterheadPreview(
  db: D1Database,
  ctx: RequestContext,
  services: { bucket: R2Bucket; browser: BrowserWorker | undefined },
  input: z.infer<typeof letterheadPreviewSchema>,
): Promise<Uint8Array> {
  if (!(await can(db, ctx, 'administration-panel.branding.manage', { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
  const national = (await listUnits(db)).find((unit) => unit.type === 'national');
  if (!national) throw new ConflictError('branding.no-national-unit');
  const ar = input.language === 'ar';
  return renderOnLetterhead(db, services, {
    ...input.draft,
    language: input.language,
    logoPlaceholder: input.logoPlaceholder,
    unit: {
      name: ar ? national.nameAr : national.nameEn,
      address: (ar ? national.letterheadAddressAr : null) ?? national.letterheadAddressEn,
    },
    letter: input.letter,
  });
}
