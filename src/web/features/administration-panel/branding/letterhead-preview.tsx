import { useState } from 'react';
import type { Branding } from '../../../../shared/administration-panel/branding';
import type { Language } from '../../../../shared/core/languages';
import { buildLetterhead } from '../../../../pdf-templates/letterhead/build-letterhead';
import { ApiError } from '../../../app/api/api-error';
import { useText } from '../../../app/language/use-text';
import { RefusalAlert } from '../../../components/refusal-alert';
import { letterheadFor, type LetterheadDraft } from './letterhead-draft';
import { useLetterheadPdf } from './use-letterhead-pdf';

interface LetterheadPreviewProps {
  draft: LetterheadDraft;
  unit: Branding['letterheadUnit'];
}

/**
 * D-090: the letterhead on screen, following every change as it is made, in
 * either language — the same template as the PDF, built in the page, so it
 * costs nothing. "Preview PDF" makes the one rendering call.
 */
export function LetterheadPreview({ draft, unit }: LetterheadPreviewProps) {
  const t = useText().services['administration-panel'].branding;
  const [language, setLanguage] = useState<Language>('en');
  const pdf = useLetterheadPdf();
  const input = letterheadFor(draft, unit, language);
  const { bodyHtml, css } = buildLetterhead(input);
  const refusal = pdf.error instanceof ApiError ? pdf.error.code : null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{t.letterhead}</h2>
      <div className="flex flex-wrap gap-2">
        {(['en', 'ar'] as const).map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={language === l}
            className="rounded border px-3 py-1 aria-pressed:bg-slate-200"
            onClick={() => {
              setLanguage(l);
            }}
          >
            {t.previewIn[l]}
          </button>
        ))}
        <button
          type="button"
          className="rounded bg-slate-900 px-3 py-1 text-white"
          disabled={pdf.isPending}
          onClick={() => {
            pdf.mutate(input);
          }}
        >
          {t.previewPdf}
        </button>
      </div>
      <RefusalAlert code={refusal} refusals={t.refusals} />
      <style>{css}</style>
      {/* The template escapes every value it inserts (build-letterhead.ts). */}
      <div
        lang={language}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        className="max-w-2xl border p-8 shadow-sm"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </section>
  );
}
