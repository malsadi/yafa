interface SettingCheckboxListProps {
  label: string;
  options: [string, string][];
  chosen: string[];
  onChange: (chosen: string[]) => void;
}

/** Several of a setting's options, each ticked or not. */
export function SettingCheckboxList({
  label,
  options,
  chosen,
  onChange,
}: SettingCheckboxListProps) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="sr-only">{label}</legend>
      {options.map(([value, name]) => (
        <label key={value} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={chosen.includes(value)}
            onChange={(event) => {
              onChange(
                event.target.checked ? [...chosen, value] : chosen.filter((v) => v !== value),
              );
            }}
          />
          {name}
        </label>
      ))}
    </fieldset>
  );
}
