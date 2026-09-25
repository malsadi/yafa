import type { NamedChoice } from '../../../../shared/administration-panel/service-settings';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { toEnabled } from './switch-choice';
import { AddUnitSwitch } from './add-unit-switch';
import { SwitchStateSelect } from './switch-state-select';

interface UnitSwitchesProps {
  serviceName: string;
  units: NamedChoice[];
  /** The unit's own value, or undefined when it follows the portal-wide one. */
  ownValue: (unitId: string) => boolean | undefined;
  busy: boolean;
  onChange: (enabled: boolean | null, unitId: string) => void;
}

/** Brief 8.4 and 25 C2: the units with their own on or off, and giving a unit one. */
export function UnitSwitches({ serviceName, units, ownValue, busy, onChange }: UnitSwitchesProps) {
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].serviceSwitches;
  const unitName = (u: NamedChoice) => ({ en: u.nameEn, ar: u.nameAr })[language];
  return (
    <div className="flex flex-col gap-2 border-s-2 ps-3">
      {units
        .filter((u) => ownValue(u.id) !== undefined)
        .map((u) => (
          <label key={u.id} className="flex items-center gap-2">
            {unitName(u)}
            <SwitchStateSelect
              label={fillText(t.unitOf, { unit: unitName(u), service: serviceName })}
              value={ownValue(u.id) ? 'on' : 'off'}
              canFollow
              busy={busy}
              onChange={(v) => {
                onChange(toEnabled(v), u.id);
              }}
            />
          </label>
        ))}
      <AddUnitSwitch
        serviceName={serviceName}
        units={units.filter((u) => ownValue(u.id) === undefined)}
        busy={busy}
        onChange={onChange}
      />
    </div>
  );
}
