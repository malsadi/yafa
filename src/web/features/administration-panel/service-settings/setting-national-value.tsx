import { useState } from 'react';
import type {
  NamedChoice,
  ServiceSettingView,
} from '../../../../shared/administration-panel/service-settings';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { SettingValueForm } from '../setting-editor/setting-value-form';
import { settingValueText } from '../setting-editor/setting-value-text';
import { SettingValueLine } from './setting-value-line';

interface SettingNationalValueProps {
  setting: ServiceSettingView;
  name: string;
  roles: readonly NamedChoice[];
  busy: boolean;
  onSet: (value: unknown) => void;
  onToggleHistory: () => void;
}

/** A setting's portal-wide value — "Not set" until entered (rule 5) — and changing it. */
export function SettingNationalValue(props: SettingNationalValueProps) {
  const { language } = useLanguage();
  const text = useText();
  const [editing, setEditing] = useState(false);
  const { setting, name } = props;
  if (editing) {
    return (
      <SettingValueForm
        settingKey={setting.key}
        input={setting.input}
        label={name}
        value={setting.national}
        roles={props.roles}
        busy={props.busy}
        onSave={(value) => {
          props.onSet(value);
          setEditing(false);
        }}
        onCancel={() => {
          setEditing(false);
        }}
      />
    );
  }
  const shown = settingValueText(text, language, {
    settingKey: setting.key,
    input: setting.input,
    value: setting.national,
    roles: props.roles,
  });
  return (
    <SettingValueLine
      name={name}
      shown={shown}
      notSet={setting.national === null}
      onChange={() => {
        setEditing(true);
      }}
      onToggleHistory={props.onToggleHistory}
    />
  );
}
