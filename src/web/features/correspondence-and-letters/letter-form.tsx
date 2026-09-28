import { useState } from 'react';
import type { WritingChoices } from '../../../shared/correspondence-and-letters/letter-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { emptyDraft, generateBody } from './letter-draft';
import { LetterDetailsFields } from './letter-details-fields';
import { LetterPreview } from './letter-preview';
import { useGenerateLetter } from './use-generate-letter';
import { useLetterPdf } from './use-letter-pdf';

/**
 * Brief 23 A2 and D-214 (O-142): fill in, see it live, "Preview PDF" if
 * wanted, then generate — numbered, filed and locked at once.
 */
export function LetterForm(props: {
  unitId: string;
  choices: WritingChoices;
  replyTo: string | null;
}) {
  const t = useText().services['correspondence-and-letters'];
  const [draft, setDraft] = useState(() => emptyDraft(props.choices, props.replyTo));
  const pdf = useLetterPdf(props.unitId);
  const generate = useGenerateLetter(props.unitId);
  const template = props.choices.templates.find((x) => x.id === draft.templateId);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          generate.mutate(generateBody(draft, template));
        }}
      >
        <LetterDetailsFields draft={draft} choices={props.choices} onChange={setDraft} />
        <ErrorAlert error={generate.error ?? pdf.error} refusals={t.refusals} />
        <p className="text-sm text-slate-600">{t.write.lockedNote}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-slate-400 px-3 py-2"
            disabled={pdf.isPending || !draft.templateId || !draft.signerRoleId}
            onClick={() => {
              pdf.mutate(draft);
            }}
          >
            {t.write.previewPdf}
          </button>
          <button
            type="submit"
            className="rounded bg-slate-900 px-3 py-2 text-white"
            disabled={generate.isPending}
          >
            {generate.isPending ? t.write.generating : t.write.generate}
          </button>
        </div>
      </form>
      <LetterPreview draft={draft} choices={props.choices} />
    </div>
  );
}
