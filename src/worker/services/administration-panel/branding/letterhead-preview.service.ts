import type { BrowserWorker } from '@cloudflare/puppeteer';
import { LOGO_POSITIONS } from '../../../../shared/administration-panel/branding-files';
import { LANGUAGES } from '../../../../shared/core/languages';
import { buildLetterhead } from '../../../../pdf-templates/letterhead/build-letterhead';
import { ConflictError, ForbiddenError, ServiceUnavailableError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { renderPdf } from '../../../core/pdf';
import { listUnits } from '../../committee-register';
import { z } from 'zod';
import { letterheadFonts, logoDataUrl } from './letterhead-assets';

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

// D-081: the design's page, fixed like the rest of it.
const PAGE = {
  format: 'A4',
  margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
} as const;

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
  if (!services.browser) throw new ServiceUnavailableError('pdf.not-available');
  const national = (await listUnits(db)).find((unit) => unit.type === 'national');
  if (!national) throw new ConflictError('branding.no-national-unit');
  const ar = input.language === 'ar';
  const { bodyHtml, css } = buildLetterhead({
    ...input.draft,
    language: input.language,
    logoSrc: await logoDataUrl(db, services.bucket),
    logoPlaceholder: input.logoPlaceholder,
    unit: {
      name: ar ? national.nameAr : national.nameEn,
      address: (ar ? national.letterheadAddressAr : null) ?? national.letterheadAddressEn,
    },
    letter: input.letter,
  });
  const fonts = await letterheadFonts(db, services.bucket);
  return renderPdf(services.browser, { bodyHtml, css, language: input.language, fonts }, PAGE);
}
