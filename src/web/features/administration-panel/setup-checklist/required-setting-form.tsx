import { useState } from 'react';
import type { SettingInput } from '../../../../shared/administration-panel/setting-input';
import { useText } from '../../../app/language/use-text';
import { SettingValueField } from './setting-value-field';

interface RequiredSettingFormProps {
  settingKey: string;
  input: SettingInput;
  label: string;
  busy: boolean;
  onSave: (value: unknown) => void;
}

/** The value as the setting's schema expects it, from what was entered. */
function toValue(input: SettingInput, entered: string): unknown {
  if (input.kind === 'yes-no') return entered === 'true';
  if (input.kind === 'whole-number') return Number(entered);
  return entered;
}

/** D-074: set a required setting from the set-up checklist. Nothing is preselected. */
export function RequiredSettingForm(props: RequiredSettingFormProps) {
  const t = useText().services['administration-panel'].setupChecklist;
  const [entered, setEntered] = useState('');
  if (props.input.kind === 'other') return null;
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSave(toValue(props.input, entered));
      }}
    >
      <SettingValueField
        settingKey={props.settingKey}
        input={props.input}
        label={props.label}
        value={entered}
        onChange={setEntered}
      />
      <button
        type="submit"
        className="rounded bg-slate-900 px-3 py-2 text-white"
        disabled={props.busy}
      >
        {t.save}
      </button>
    </form>
  );
}
