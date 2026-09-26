import type { LetterDirection } from '../../../shared/resources-library/filed-letter';
import { ApiError } from '../../app/api/api-error';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { RefusalAlert } from '../../components/refusal-alert';
import { StatusMessage } from '../../components/status-message';
import { fillText } from '../../text/fill-text';
import { useFiledLetters } from './use-filed-letters';
import { useLibraryUnit } from './use-library-unit';

/** Brief 16 D2, D3 and 7.3: the unit's own letters out or in, read-only, to download. */
export function FiledLettersPage({ direction }: { direction: LetterDirection }) {
  const unitId = useLibraryUnit();
  const text = useText();
  const t = text.services['resources-library'].filedLetters;
  const formatTimestamp = useFormatTimestamp();
  const { letters, download } = useFiledLetters(unitId, direction);
  const failure = letters.error ?? download.error;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.headings[direction]}</h2>
      <p className="text-sm text-slate-600">{t.explanation[direction]}</p>
      <RefusalAlert
        code={failure instanceof ApiError ? failure.code : null}
        refusals={t.refusals}
      />
      {letters.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {letters.data?.length === 0 && <p>{t.none}</p>}
      <ul className="flex flex-col gap-2">
        {letters.data?.map((letter) => (
          <li key={letter.id} className="flex flex-wrap items-center gap-3">
            <span>
              {fillText(t.filedOn, {
                reference: letter.referenceNumber,
                date: formatTimestamp(letter.filedAt),
              })}
            </span>
            <button
              type="button"
              className="rounded border border-slate-400 px-3 py-1"
              disabled={download.isPending}
              onClick={() => {
                download.mutate({ id: letter.id, fileName: letter.fileName });
              }}
            >
              {t.download}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
