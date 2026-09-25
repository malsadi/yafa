import { RefusalAlert } from '../../../components/refusal-alert';
import { StatusMessage } from '../../../components/status-message';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { useRoleDesignations } from './use-role-designations';

/** Brief 25 B2: which standard role is designated as each register officer (7.2). */
export function DesignationsSection() {
  const { language } = useLanguage();
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.roles;
  const { designations, change, refusal } = useRoleDesignations();
  if (designations.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (designations.isError) {
    return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  }
  const { standardRoles } = designations.data;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.designations}</h2>
      <p className="max-w-prose">{t.designationsIntro}</p>
      <RefusalAlert
        code={refusal}
        refusals={text.services['administration-panel'].roles.refusals}
      />
      {designations.data.designations.map(({ designation, roleId }) => (
        <label key={designation} className="flex flex-col gap-1">
          <span>{admin.designations[designation]}</span>
          <select
            className="max-w-md rounded border border-slate-400 p-2"
            value={roleId ?? ''}
            disabled={change.isPending}
            onChange={(event) => {
              change.mutate({ designation, roleId: event.target.value || null });
            }}
          >
            <option value="">{t.noDesignatedRole}</option>
            {standardRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {{ en: role.nameEn, ar: role.nameAr }[language]}
              </option>
            ))}
          </select>
        </label>
      ))}
    </section>
  );
}
