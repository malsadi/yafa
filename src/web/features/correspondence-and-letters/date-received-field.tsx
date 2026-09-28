import { todayInLondon } from '../../app/language/today-in-london';

/** D-214 (O-143): the date a letter arrived — up to today, never in the future. */
export function DateReceivedField(props: {
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
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
      />
    </label>
  );
}
