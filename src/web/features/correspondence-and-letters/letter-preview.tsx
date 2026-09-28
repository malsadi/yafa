import type { WritingChoices } from '../../../shared/correspondence-and-letters/letter-records';
import { buildLetterhead } from '../../../pdf-templates/letterhead/build-letterhead';
import { useText } from '../../app/language/use-text';
import { useBranding } from '../../app/session/use-branding';
import { StatusMessage } from '../../components/status-message';
import { previewLetterhead, type LetterDraft } from './letter-draft';

/** D-214 (O-142): the letter as it is written, live, on the unit's letterhead. */
export function LetterPreview(props: { draft: LetterDraft; choices: WritingChoices }) {
  const text = useText();
  const t = text.services['correspondence-and-letters'].write;
  const branding = useBranding();
  if (branding.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (branding.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const input = previewLetterhead(props.draft, props.choices, branding.data);
  if (!input) return null;
  const { bodyHtml, css } = buildLetterhead(input);
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{t.preview}</h3>
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
