import { ApiError } from '../../app/api/api-error';
import { useText } from '../../app/language/use-text';
import { RefusalAlert } from '../../components/refusal-alert';
import type { LetterTemplateDraft } from './library.api';
import { useLetterTemplatePdf } from './use-letter-template-pdf';
import { useLibraryUnit } from './use-library-unit';

/** D-111: "Preview PDF" — the template on the real letterhead, with the logo. */
export function LetterTemplatePdfButton({ draft }: { draft: LetterTemplateDraft }) {
  const t = useText().services['resources-library'].letterTemplates;
  const pdf = useLetterTemplatePdf(useLibraryUnit());
  const refusal = pdf.error instanceof ApiError ? pdf.error.code : null;
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="self-start rounded bg-slate-900 px-3 py-1 text-white"
        disabled={pdf.isPending || draft.body.trim() === ''}
        onClick={() => {
          pdf.mutate(draft);
        }}
      >
        {t.previewPdf}
      </button>
      <RefusalAlert code={refusal} refusals={t.refusals} />
    </div>
  );
}
