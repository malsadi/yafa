import { StatusMessage } from '../../../components/status-message';
import { BilingualNameForm } from '../../../components/bilingual-name-form';
import { RenamableItem } from '../../../components/renamable-item';
import { useText } from '../../../app/language/use-text';
import { useRegisterUnit } from '../use-register-unit';
import { StandardRoleList } from './standard-role-list';
import { useBranchRoles } from './use-branch-roles';

const NO_NAMES = { nameEn: '', nameAr: '' };

/** Brief 14 B2: the standard roles every branch uses, and the branch's own extra roles. */
export function BranchRolesPage() {
  const unit = useRegisterUnit();
  const text = useText();
  const t = text.services['committee-register'].branchRoles;
  const { roles, add, rename, refusal } = useBranchRoles(unit.id);
  if (roles.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (roles.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const own = roles.data.filter((role) => role.unitId !== null);
  const canChange = unit.type === 'branch' && unit.status === 'active';
  const refusals: Partial<Record<string, string>> = t.refusals;
  return (
    <div className="flex flex-col gap-4">
      <StandardRoleList roles={roles.data.filter((role) => role.unitId === null)} />
      {unit.type === 'branch' && <h2 className="text-lg font-semibold">{t.ownRoles}</h2>}
      {refusal && (
        <p role="alert" className="rounded bg-amber-100 p-3 text-amber-950">
          {refusals[refusal] ?? text.portalShell.somethingWentWrong}
        </p>
      )}
      {unit.type === 'branch' && own.length === 0 && <p>{t.noOwnRoles}</p>}
      <ul className="flex flex-col gap-2">
        {own.map((role) => (
          <RenamableItem
            key={role.id}
            names={{ nameEn: role.nameEn, nameAr: role.nameAr }}
            busy={add.isPending || rename.isPending || !canChange}
            onRename={(names) => {
              rename.mutate({ roleId: role.id, names });
            }}
          />
        ))}
      </ul>
      {canChange && (
        <BilingualNameForm
          key={own.length}
          initial={NO_NAMES}
          busy={add.isPending}
          submitLabel={t.addRole}
          onSubmit={(names) => {
            add.mutate(names);
          }}
        />
      )}
    </div>
  );
}
