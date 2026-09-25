import { useState } from 'react';
import type { NamedChoice } from '../../../../shared/administration-panel/service-settings';
import type { SettingInput } from '../../../../shared/administration-panel/setting-input';
import { useText } from '../../../app/language/use-text';
import { fromDraft, toDraft } from './setting-draft';
import { SettingValueInput } from './setting-value-input';

interface SettingValueFormProps {
  settingKey: string;
  input: SettingInput;
  label: string;
  /** The value now, or null while not configured: nothing is preselected (rule 5). */
  value: unknown;
  roles?: readonly NamedChoice[];
  busy: boolean;
  onSave: (value: unknown) => void;
  onCancel?: () => void;
}

/** Brief 8.1: enter a setting's value; the server checks it against the setting's schema. */
export function SettingValueForm(props: SettingValueFormProps) {
  const t = useText().services['administration-panel'].serviceSettings;
  const [draft, setDraft] = useState(() => toDraft(props.input, props.value));
  if (props.input.kind === 'other') return <p className="text-sm">{t.cannotEnterHere}</p>;
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSave(fromDraft(props.input, draft));
      }}
    >
      <SettingValueInput
        settingKey={props.settingKey}
        input={props.input}
        label={props.label}
        roles={props.roles ?? []}
        draft={draft}
        onChange={setDraft}
      />
      <button
        type="submit"
        className="rounded bg-slate-900 px-3 py-2 text-white"
        disabled={props.busy}
      >
        {t.save}
      </button>
      {props.onCancel && (
        <button type="button" className="rounded border px-3 py-2" onClick={props.onCancel}>
          {t.cancel}
        </button>
      )}
    </form>
  );
}
