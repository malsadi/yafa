import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { RefusalAlert } from './refusal-alert';
import { RoleNameForm } from './role-name-form';
import { StandardRoleRow } from './standard-role-row';
import { useStandardRoles } from './use-standard-roles';

const NO_NAMES = { nameEn: '', nameAr: '' };

/** Brief 25 B2 and 14 B2: the national list of standard roles (national register officer). */
export function StandardRolesSection() {
  const text = useText();
  const t = text.services['administration-panel'].roles;
  const { roles, create, rename, refusal } = useStandardRoles();
  if (roles.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (roles.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const busy = create.isPending || rename.isPending;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.standardRoles}</h2>
      <p className="max-w-prose">{t.standardRolesIntro}</p>
      <RefusalAlert code={refusal} />
      {roles.data.length === 0 ? (
        <p>{t.noRoles}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {roles.data.map((role) => (
            <StandardRoleRow
              key={role.id}
              role={role}
              busy={busy}
              onRename={(names) => {
                rename.mutate({ roleId: role.id, names });
              }}
            />
          ))}
        </ul>
      )}
      <h3 className="font-semibold">{t.addRole}</h3>
      <RoleNameForm
        key={roles.dataUpdatedAt}
        initial={NO_NAMES}
        busy={busy}
        submitLabel={t.add}
        onSubmit={(names) => {
          create.mutate(names);
        }}
      />
    </section>
  );
}
