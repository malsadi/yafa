import type { TimelineScope } from '../../../shared/achievements-and-reports/achievement-records';
import { useText } from '../../app/language/use-text';

/** D-215 (O-150): which timeline is shown — this unit's, the General Council's, or every branch's. */
export function TimelineScopes(props: {
  scopes: TimelineScope[];
  chosen: TimelineScope;
  onChoose: (scope: TimelineScope) => void;
}) {
  const t = useText().services['achievements-and-reports'].timeline;
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {props.scopes.map((s) => (
        <button
          key={s}
          type="button"
          aria-pressed={s === props.chosen}
          className={`rounded px-3 py-1 ${s === props.chosen ? 'bg-slate-200 font-medium' : 'border border-slate-300'}`}
          onClick={() => {
            props.onChoose(s);
          }}
        >
          {t.scopes[s]}
        </button>
      ))}
    </div>
  );
}
