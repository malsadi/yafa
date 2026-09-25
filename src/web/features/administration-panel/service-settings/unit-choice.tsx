import type { NamedChoice } from '../../../../shared/administration-panel/service-settings';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';

interface UnitChoiceProps {
  units: readonly NamedChoice[];
  value: string;
  onChange: (unitId: string) => void;
}

/** The unit a setting's own value is given to (brief 8.1). */
export function UnitChoice({ units, value, onChange }: UnitChoiceProps) {
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].serviceSettings;
  return (
    <label className="flex flex-col gap-1">
      <span>{t.addOverride}</span>
      <select
        className="max-w-md rounded border border-slate-400 p-2"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        <option value="">{t.chooseUnit}</option>
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {{ en: u.nameEn, ar: u.nameAr }[language]}
          </option>
        ))}
      </select>
    </label>
  );
}
