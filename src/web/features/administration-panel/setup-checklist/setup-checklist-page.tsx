import { SERVICES } from '../../../../shared/core/services';
import { PageHeading } from '../../../components/page-heading';
import { RefusalAlert } from '../../../components/refusal-alert';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { useActiveSession } from '../../../app/session/use-active-session';
import { checklistItemText } from './checklist-item-text';
import { ChecklistEntry } from './checklist-entry';
import { useSetRequiredSetting } from './use-set-required-setting';
import { useSetupChecklist } from './use-setup-checklist';

/** Brief 25 C6: every required setting, list and designation not yet configured, by service. */
export function SetupChecklistPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const canSet = useActiveSession().context.capabilities.includes(
    'administration-panel.setup-checklist.manage',
  );
  const checklist = useSetupChecklist();
  const { save, refusal } = useSetRequiredSetting();
  if (checklist.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (checklist.isError)
    return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const services = SERVICES.filter((s) => checklist.data.some((i) => i.service === s.slug));
  return (
    <div className="flex flex-col gap-6">
      <div>
        <PageHeading>{admin.screens['setup-checklist']}</PageHeading>
        <p className="max-w-prose">{admin.setupChecklist.intro}</p>
      </div>
      <RefusalAlert code={refusal} refusals={admin.setupChecklist.refusals} />
      {services.length === 0 && <p>{admin.setupChecklist.complete}</p>}
      {services.map(({ slug }) => (
        <section key={slug} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{text.services[slug].name}</h2>
          <ul className="flex list-disc flex-col gap-2 ps-6">
            {checklist.data
              .filter((item) => item.service === slug)
              .map((item) => {
                const label = checklistItemText(text, item);
                return (
                  <ChecklistEntry
                    key={label}
                    item={item}
                    label={label}
                    canSet={canSet}
                    busy={save.isPending}
                    onSet={(key, value) => {
                      save.mutate({ key, value });
                    }}
                  />
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
