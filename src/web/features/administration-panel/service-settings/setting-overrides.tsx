import { useState } from 'react';
import type {
  NamedChoice,
  ServiceSettingView,
} from '../../../../shared/administration-panel/service-settings';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { SettingValueForm } from '../setting-editor/setting-value-form';
import { settingValueText } from '../setting-editor/setting-value-text';
import { OverrideLine } from './override-line';
import { UnitChoice } from './unit-choice';
import { useScopeName } from './use-scope-name';

interface SettingOverridesProps {
  setting: ServiceSettingView;
  label: string;
  units: readonly NamedChoice[];
  roles: readonly NamedChoice[];
  busy: boolean;
  onSet: (value: unknown, unitId: string) => void;
  onRemove: (unitId: string) => void;
}

/** Brief 8.1 and 25 C1: the units with their own value, and giving a unit one. */
export function SettingOverrides(props: SettingOverridesProps) {
  const { language } = useLanguage();
  const text = useText();
  const t = text.services['administration-panel'].serviceSettings;
  const unitName = useScopeName(props.units);
  const [unitId, setUnitId] = useState('');
  const { setting } = props;
  const shown = (value: unknown) =>
    settingValueText(text, language, {
      settingKey: setting.key,
      input: setting.input,
      value,
      roles: props.roles,
    });
  return (
    <div className="flex flex-col gap-2 border-s-2 ps-3">
      <p className="font-medium">{t.overrides}</p>
      {setting.overrides.length === 0 && <p className="text-sm">{t.noOverrides}</p>}
      {setting.overrides.map((o) => (
        <OverrideLine
          key={o.unitId}
          unit={unitName(o.unitId)}
          value={shown(o.value)}
          busy={props.busy}
          onRemove={() => {
            props.onRemove(o.unitId);
          }}
        />
      ))}
      <UnitChoice units={props.units} value={unitId} onChange={setUnitId} />
      {unitId !== '' && (
        <SettingValueForm
          key={unitId}
          settingKey={setting.key}
          input={setting.input}
          label={props.label}
          value={setting.overrides.find((o) => o.unitId === unitId)?.value ?? null}
          roles={props.roles}
          busy={props.busy}
          onSave={(value) => {
            props.onSet(value, unitId);
            setUnitId('');
          }}
        />
      )}
    </div>
  );
}
