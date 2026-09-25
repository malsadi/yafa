import { BilingualNameForm } from '../../../components/bilingual-name-form';
import { RefusalAlert } from '../../../components/refusal-alert';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { BranchRolesAllowedControl } from './branch-roles-allowed-control';
import { StandardRoleItems } from './standard-role-items';
import { useStandardRoles } from './use-standard-roles';

const NO_NAMES = { nameEn: '', nameAr: '' };

/** Brief 25 B2 and 14 B2: the national list of standard roles (national register officer). */
export function StandardRolesSection() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.roles;
  const { roles, create, rename, order, refusal } = useStandardRoles();
  if (roles.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (roles.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const busy = create.isPending || rename.isPending || order.isPending;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.standardRoles}</h2>
      <p className="max-w-prose">{t.standardRolesIntro}</p>
      <BranchRolesAllowedControl />
      <RefusalAlert
        code={refusal}
        refusals={text.services['administration-panel'].roles.refusals}
      />
      <StandardRoleItems
        roles={roles.data}
        busy={busy}
        onRename={(roleId, names) => {
          rename.mutate({ roleId, names });
        }}
        onOrder={(roleIds) => {
          order.mutate(roleIds);
        }}
      />
      <h3 className="font-semibold">{t.addRole}</h3>
      <BilingualNameForm
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
