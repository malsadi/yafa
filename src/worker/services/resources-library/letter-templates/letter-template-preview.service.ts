import { templateLetter } from '../../../../shared/resources-library/template-letter';
import { ConflictError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { readBranding, renderOnLetterhead, type PdfRendering } from '../../administration-panel';
import { requireLibraryCapability } from '../library-access';
import { MANAGE } from './letter-template-guards';
import type { LetterTemplatePreview } from './letter-template-preview.schema';

/**
 * D-111 and D-102: the template being written as a PDF on the unit's real
 * letterhead, with the logo, fields shown as placeholders — one Browser
 * Rendering call per press, as on the Branding screen (D-090).
 */
export async function renderLetterTemplatePreview(
  db: D1Database,
  ctx: RequestContext,
  services: PdfRendering,
  params: { unitId: string; preview: LetterTemplatePreview },
): Promise<Uint8Array> {
  const unit = await requireLibraryCapability(db, ctx, MANAGE, params.unitId);
  const branding = await readBranding(db);
  const { organisationName, mainColour, accentColour, logoPosition } = branding;
  if (!organisationName || !mainColour || !accentColour || !logoPosition) {
    throw new ConflictError('setting.not-configured');
  }
  const { template, signer } = params.preview;
  const ar = template.language === 'ar';
  const unitName = ar ? unit.nameAr : unit.nameEn;
  return renderOnLetterhead(services, {
    language: template.language,
    organisationName: (ar ? organisationName.ar : null) ?? organisationName.en,
    mainColour,
    accentColour,
    logoPosition,
    unit: {
      name: unitName,
      address: (ar ? unit.letterheadAddressAr : null) ?? unit.letterheadAddressEn,
    },
    letter: { ...templateLetter(template), signer: { ...signer, unit: unitName } },
  });
}
