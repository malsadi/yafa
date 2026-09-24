import type { MeUnit } from '../../shared/core/me-response';
import { useLanguage } from '../app/language/use-language';
import { useText } from '../app/language/use-text';
import { useSelectedUnit } from '../app/unit/use-selected-unit';

/** Shown only to people in more than one unit (brief section 26, Phase 0). */
export function UnitSwitcher({ units }: { units: MeUnit[] }) {
  const { unit, selectUnit } = useSelectedUnit();
  const text = useText();
  const { language } = useLanguage();
  if (units.length < 2) {
    return null;
  }
  return (
    <label className="flex items-center gap-2">
      <span>{text.portalShell.unitSwitcher.label}</span>
      <select
        className="rounded border px-2 py-2"
        value={unit?.id}
        onChange={(event) => {
          selectUnit(event.target.value);
        }}
      >
        {units.map((option) => (
          <option key={option.id} value={option.id} dir="auto">
            {{ en: option.nameEn, ar: option.nameAr }[language]}
          </option>
        ))}
      </select>
    </label>
  );
}
