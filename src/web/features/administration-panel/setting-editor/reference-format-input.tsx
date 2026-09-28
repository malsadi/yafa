import { useEffect, useRef } from 'react';
import { referenceFormatProblems } from '../../../../shared/correspondence-and-letters/reference-format';
import { useText } from '../../../app/language/use-text';

/**
 * Brief 23 B1 and D-214 (O-137): a reference number format, checked as it
 * is typed by the same rule the Worker applies. A format without its
 * number or year is refused here, before it is ever sent.
 */
export function ReferenceFormatInput(props: {
  label: string;
  draft: string;
  onChange: (draft: string) => void;
}) {
  const t = useText().services['administration-panel'].serviceSettings;
  const input = useRef<HTMLInputElement>(null);
  const problems = referenceFormatProblems(props.draft).map((p) => t.referenceFormatProblems[p]);
  const refusal = problems.join(' ');
  useEffect(() => {
    input.current?.setCustomValidity(refusal);
  }, [refusal]);
  return (
    <div className="flex w-full flex-col gap-1">
      <input
        ref={input}
        type="text"
        dir="ltr"
        required
        aria-label={props.label}
        aria-describedby="reference-format-hint"
        className="rounded border border-slate-400 p-2 font-mono"
        value={props.draft}
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
      />
      <p id="reference-format-hint" className="text-sm text-slate-600">
        {t.referenceFormatHint}
      </p>
      {props.draft !== '' && problems.length > 0 && (
        <ul role="alert" className="text-sm text-red-700">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
