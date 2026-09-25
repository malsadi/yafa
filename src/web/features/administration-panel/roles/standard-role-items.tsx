import type { RoleRecord } from '../../../../shared/committee-register/role-record';
import type { BilingualNames } from '../../../components/bilingual-name-form';
import { MoveButtons } from '../../../components/move-buttons';
import { movedOne } from '../../../components/moved-one';
import { RenamableItem } from '../../../components/renamable-item';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';

interface StandardRoleItemsProps {
  roles: RoleRecord[];
  busy: boolean;
  onRename: (roleId: string, names: BilingualNames) => void;
  onOrder: (roleIds: string[]) => void;
}

/** Brief 14 B2 and D-071: the standard roles in order, each renamed or moved in place. */
export function StandardRoleItems({ roles, busy, onRename, onOrder }: StandardRoleItemsProps) {
  const { language } = useLanguage();
  const admin = useText().services['administration-panel'];
  if (roles.length === 0) return <p>{admin.roles.noRoles}</p>;
  const ids = roles.map((role) => role.id);
  return (
    <ul className="flex flex-col gap-2">
      {roles.map((role, index) => (
        <RenamableItem
          key={role.id}
          names={{ nameEn: role.nameEn, nameAr: role.nameAr }}
          note={role.designation ? admin.designations[role.designation] : undefined}
          busy={busy}
          actions={
            <MoveButtons
              name={{ en: role.nameEn, ar: role.nameAr }[language]}
              isFirst={index === 0}
              isLast={index === ids.length - 1}
              busy={busy}
              onMove={(step) => {
                onOrder(movedOne(ids, index, step));
              }}
            />
          }
          onRename={(names) => {
            onRename(role.id, names);
          }}
        />
      ))}
    </ul>
  );
}
