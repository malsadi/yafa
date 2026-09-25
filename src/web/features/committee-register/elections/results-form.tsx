import { useState } from 'react';
import type { ElectionPosition } from '../../../../shared/committee-register/election-record';
import { useText } from '../../../app/language/use-text';
import type { ResultInput } from './elections.api';
import { ResultRow, type ResultDraft } from './result-row';

interface ResultsFormProps {
  positions: ElectionPosition[];
  busy: boolean;
  onSave: (results: ResultInput[]) => void;
}

function draftsOf(positions: ElectionPosition[]): ResultDraft[] {
  return positions.flatMap((p) =>
    p.candidates.map((c) => ({
      candidateId: c.id,
      name: c.name,
      votes: c.votes === null ? '' : String(c.votes),
      elected: c.elected ?? false,
    })),
  );
}

/** Brief 14 C1 and D-055: every candidate's votes and whether elected, saved together. */
export function ResultsForm({ positions, busy, onSave }: ResultsFormProps) {
  const t = useText().services['committee-register'].elections;
  const [results, setResults] = useState(() => draftsOf(positions));
  if (results.length === 0) return null;
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(
          results.map((r) => ({
            candidateId: r.candidateId,
            votes: Number(r.votes),
            elected: r.elected,
          })),
        );
      }}
    >
      {results.map((result, index) => (
        <ResultRow
          key={result.candidateId}
          result={result}
          onChange={(patch) => {
            setResults((all) => all.map((r, i) => (i === index ? { ...r, ...patch } : r)));
          }}
        />
      ))}
      <button
        type="submit"
        className="self-start rounded bg-slate-900 px-3 py-2 text-white"
        disabled={busy}
      >
        {t.saveResults}
      </button>
    </form>
  );
}
