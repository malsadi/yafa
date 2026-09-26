import type { LetterheadUnit } from '../../../shared/resources-library/letter-template';
import { buildLetterhead } from '../../../pdf-templates/letterhead/build-letterhead';
import { useText } from '../../app/language/use-text';
import { useBranding } from '../../app/session/use-branding';
import { StatusMessage } from '../../components/status-message';
import { LetterTemplatePdfButton } from './letter-template-pdf-button';
import type { LetterTemplateDraft } from './library.api';
import { templateLetterhead } from './template-letterhead';

/** D-102 and P19: the template as it is written, live, on the unit's letterhead. */
export function LetterTemplatePreview(props: { draft: LetterTemplateDraft; unit: LetterheadUnit }) {
  const text = useText();
  const t = text.services['resources-library'].letterTemplates;
  const branding = useBranding();
  if (branding.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (branding.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const input = templateLetterhead(props.draft, branding.data, props.unit);
  if (!input) return <StatusMessage>{t.previewNotReady}</StatusMessage>;
  const { bodyHtml, css } = buildLetterhead(input);
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{t.preview}</h3>
      <LetterTemplatePdfButton draft={props.draft} />
      <style>{css}</style>
      {/* The template escapes every value it inserts (build-letterhead.ts). */}
      <div
        lang={input.language}
        dir={input.language === 'ar' ? 'rtl' : 'ltr'}
        className="max-w-2xl border p-8 shadow-sm"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </section>
  );
}
