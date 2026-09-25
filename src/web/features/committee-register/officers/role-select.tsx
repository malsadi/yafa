import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { useUnitRoles } from './use-unit-roles';

interface RoleSelectProps {
  unitId: string;
  value: string;
  onChange: (roleId: string) => void;
}

/** A required choice among the roles the unit can use. */
export function RoleSelect({ unitId, value, onChange }: RoleSelectProps) {
  const { language } = useLanguage();
  const t = useText().services['committee-register'].register;
  const roles = useUnitRoles(unitId);
  return (
    <label className="flex flex-col gap-1">
      <span>{t.role}</span>
      <select
        className="rounded border border-slate-400 p-2"
        required
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        <option value="" disabled>
          {t.chooseRole}
        </option>
        {(roles.data ?? []).map((role) => (
          <option key={role.id} value={role.id}>
            {{ en: role.nameEn, ar: role.nameAr }[language]}
          </option>
        ))}
      </select>
    </label>
  );
}
