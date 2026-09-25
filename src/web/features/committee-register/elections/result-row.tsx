import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

/** One candidate's result as it is being entered. */
export interface ResultDraft {
  candidateId: string;
  name: string;
  votes: string;
  elected: boolean;
}

interface ResultRowProps {
  result: ResultDraft;
  onChange: (patch: Partial<ResultDraft>) => void;
}

/** Brief 14 C1 and D-055: a candidate's votes, and whether they were elected. */
export function ResultRow({ result, onChange }: ResultRowProps) {
  const t = useText().services['committee-register'].elections;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="min-w-40">{result.name}</span>
      <input
        type="number"
        min={0}
        required
        aria-label={fillText(t.votesFor, { name: result.name })}
        className="w-24 rounded border border-slate-400 p-2"
        value={result.votes}
        onChange={(event) => {
          onChange({ votes: event.target.value });
        }}
      />
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={result.elected}
          onChange={(event) => {
            onChange({ elected: event.target.checked });
          }}
        />
        {t.elected}
      </label>
    </div>
  );
}
