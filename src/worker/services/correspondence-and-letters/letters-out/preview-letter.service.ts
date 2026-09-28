import { getTextBundle } from '../../../../web/text';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { readBranding } from '../../administration-panel';
import { requireLetterCapability, WRITE } from '../letter-access';
import { letterOutDocument } from './letter-out-document';
import type { LetterRenderer } from './letter-renderer';
import { previewFields, requireSigner, requireUsableTemplate } from './letter-writing';
import type { PreviewLetter } from './letters-out.schema';

/**
 * D-214 (O-142) and D-111: "Preview PDF" — the letter as the form stands,
 * on the real letterhead, one Browser Rendering call per press. Nothing is
 * stored or numbered; the reference shows where it will go.
 */
export async function previewLetterPdf(
  db: D1Database,
  ctx: RequestContext,
  render: LetterRenderer,
  params: PreviewLetter & { unitId: string },
): Promise<Uint8Array> {
  const unit = await requireLetterCapability(db, ctx, WRITE, params.unitId);
  const template = await requireUsableTemplate(db, unit.id, params.templateId);
  const signer = await requireSigner(db, ctx, { unitId: unit.id, roleId: params.signerRoleId });
  const t = getTextBundle(template.language).services['correspondence-and-letters'].letterPdf;
  const letter = letterOutDocument(
    {
      template,
      fieldValues: previewFields(template, params.fieldValues),
      recipientName: params.recipientName,
      recipientAddress: params.recipientAddress,
      reference: t.referenceToCome,
      letterDate: getTodayInLondon(),
      signer,
    },
    unit,
    await readBranding(db),
  );
  return render(letter);
}
