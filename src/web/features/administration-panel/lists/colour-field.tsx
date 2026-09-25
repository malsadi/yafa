import { useText } from '../../../app/language/use-text';

/** D-076: a calendar colour, typed as #RRGGBB and shown beside it. Nothing is preselected. */
export function ColourField(props: { value: string; onChange: (value: string) => void }) {
  const t = useText().services['administration-panel'].lists;
  return (
    <label className="flex flex-col gap-1">
      <span>{t.colour}</span>
      <span className="flex items-center gap-2">
        <input
          required
          dir="ltr"
          pattern="#[0-9A-Fa-f]{6}"
          placeholder="#RRGGBB"
          className="w-28 rounded border border-slate-400 p-2"
          value={props.value}
          onChange={(event) => {
            props.onChange(event.target.value);
          }}
        />
        <span
          aria-hidden
          className="h-8 w-8 rounded border"
          style={{ backgroundColor: props.value }}
        />
      </span>
    </label>
  );
}
