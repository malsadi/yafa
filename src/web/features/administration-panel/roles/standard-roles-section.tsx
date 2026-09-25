import { BilingualNameForm } from '../../../components/bilingual-name-form';
import { RenamableItem } from '../../../components/renamable-item';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { RefusalAlert } from './refusal-alert';
import { useStandardRoles } from './use-standard-roles';

const NO_NAMES = { nameEn: '', nameAr: '' };

/** Brief 25 B2 and 14 B2: the national list of standard roles (national register officer). */
export function StandardRolesSection() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.roles;
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
            <RenamableItem
              key={role.id}
              names={{ nameEn: role.nameEn, nameAr: role.nameAr }}
              note={role.designation ? admin.designations[role.designation] : undefined}
              busy={busy}
              onRename={(names) => {
                rename.mutate({ roleId: role.id, names });
              }}
            />
          ))}
        </ul>
      )}
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
