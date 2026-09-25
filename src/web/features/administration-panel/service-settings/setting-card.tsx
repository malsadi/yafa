import { useState } from 'react';
import type {
  NamedChoice,
  ServiceSettingView,
} from '../../../../shared/administration-panel/service-settings';
import { useText } from '../../../app/language/use-text';
import { RefusalAlert } from '../../../components/refusal-alert';
import { settingName } from '../setting-name';
import { SettingHistory } from './setting-history';
import { SettingNationalValue } from './setting-national-value';
import { SettingOverrides } from './setting-overrides';

interface SettingCardProps {
  setting: ServiceSettingView;
  units: readonly NamedChoice[];
  roles: readonly NamedChoice[];
  refusal: string | null;
  busy: boolean;
  onSet: (value: unknown, unitId?: string) => void;
  onRemoveOverride: (unitId: string) => void;
  onRestore: (historyId: string) => void;
}

/** Brief 25 C1: one setting — its value, any unit overrides, and its history. */
export function SettingCard(props: SettingCardProps) {
  const text = useText();
  const t = text.services['administration-panel'].serviceSettings;
  const [showHistory, setShowHistory] = useState(false);
  const { setting, units, roles, busy } = props;
  const name = settingName(text, setting.key);
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <p className="font-medium">
        {name}
        {setting.required && (
          <span className="ms-2 rounded bg-slate-200 px-2 text-sm">{t.required}</span>
        )}
      </p>
      <RefusalAlert code={props.refusal} refusals={t.refusals} />
      <SettingNationalValue
        setting={setting}
        name={name}
        roles={roles}
        busy={busy}
        onSet={props.onSet}
        onToggleHistory={() => {
          setShowHistory((shown) => !shown);
        }}
      />
      {setting.unitOverrideAllowed && (
        <SettingOverrides
          setting={setting}
          label={name}
          units={units}
          roles={roles}
          busy={busy}
          onSet={props.onSet}
          onRemove={props.onRemoveOverride}
        />
      )}
      {showHistory && (
        <SettingHistory
          setting={setting}
          units={units}
          roles={roles}
          busy={busy}
          onRestore={props.onRestore}
        />
      )}
    </li>
  );
}
