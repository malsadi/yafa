import type { SettingInput } from '../../../../shared/administration-panel/setting-input';
import { useText } from '../../../app/language/use-text';

interface SettingValueFieldProps {
  settingKey: string;
  input: SettingInput;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/** The field a setting's value is entered in: a choice, yes or no, or a whole number. */
export function SettingValueField(props: SettingValueFieldProps) {
  const admin = useText().services['administration-panel'];
  const t = admin.setupChecklist;
  const labels: Partial<Record<string, Partial<Record<string, string>>>> = admin.settingOptions;
  const options =
    props.input.kind === 'choice'
      ? props.input.options.map((o) => [o, labels[props.settingKey]?.[o] ?? o] as const)
      : [['true', t.yes] as const, ['false', t.no] as const];
  const change = (event: { target: { value: string } }) => {
    props.onChange(event.target.value);
  };
  const className = 'rounded border border-slate-400 p-2';
  return (
    <label className="flex flex-col gap-1">
      <span className="sr-only">{props.label}</span>
      {props.input.kind === 'whole-number' ? (
        <input type="number" required className={className} value={props.value} onChange={change} />
      ) : (
        <select required className={className} value={props.value} onChange={change}>
          <option value="" disabled>
            {t.choose}
          </option>
          {options.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      )}
    </label>
  );
}
