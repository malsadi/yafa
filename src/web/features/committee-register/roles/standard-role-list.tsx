import type { RoleRecord } from '../../../../shared/committee-register/role-record';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';

/** Brief 14 B2: the national list every branch uses, read-only here. */
export function StandardRoleList({ roles }: { roles: RoleRecord[] }) {
  const { language } = useLanguage();
  const t = useText().services['committee-register'].branchRoles;
  return (
    <>
      <h2 className="text-lg font-semibold">{t.standardRoles}</h2>
      <ul className="list-disc ps-6">
        {roles.map((role) => (
          <li key={role.id}>{{ en: role.nameEn, ar: role.nameAr }[language]}</li>
        ))}
      </ul>
    </>
  );
}
