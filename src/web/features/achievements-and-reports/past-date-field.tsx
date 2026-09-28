import { todayInLondon } from '../../app/language/today-in-london';

/** O-151: a date up to today, never in the future. */
export function PastDateField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span>{props.label}</span>
      <input
        type="date"
        required
        max={todayInLondon()}
        className="rounded border border-slate-400 p-2"
        value={props.value}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      />
    </label>
  );
}
