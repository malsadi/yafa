import type { NamedChoice } from '../../../../shared/administration-panel/service-settings';
import type { SettingInput } from '../../../../shared/administration-panel/setting-input';
import { useText } from '../../../app/language/use-text';
import { SettingCheckboxList } from './setting-checkbox-list';
import type { SettingDraft } from './setting-draft';
import { useSettingOptions } from './use-setting-labels';

interface SettingValueInputProps {
  settingKey: string;
  input: SettingInput;
  label: string;
  roles: readonly NamedChoice[];
  draft: SettingDraft;
  onChange: (draft: SettingDraft) => void;
}

/** Where a setting's value is entered: a choice, several, yes or no, a whole number, or roles. */
export function SettingValueInput(props: SettingValueInputProps) {
  const t = useText().services['administration-panel'].serviceSettings;
  const options = useSettingOptions(props.settingKey, props.input, props.roles);
  const className = 'rounded border border-slate-400 p-2';
  if (Array.isArray(props.draft)) {
    return (
      <SettingCheckboxList
        label={props.label}
        options={options}
        chosen={props.draft}
        onChange={props.onChange}
      />
    );
  }
  const change = (event: { target: { value: string } }) => {
    props.onChange(event.target.value);
  };
  if (props.input.kind === 'whole-number') {
    return (
      <input
        type="number"
        required
        aria-label={props.label}
        className={className}
        value={props.draft}
        onChange={change}
      />
    );
  }
  return (
    <select
      required
      aria-label={props.label}
      className={className}
      value={props.draft}
      onChange={change}
    >
      <option value="" disabled>
        {t.choose}
      </option>
      {options.map(([value, name]) => (
        <option key={value} value={value}>
          {name}
        </option>
      ))}
    </select>
  );
}
