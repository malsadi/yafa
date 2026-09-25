import { Link } from 'react-router';
import type { ChecklistItem } from '../../../../shared/administration-panel/setup-checklist';
import { SERVICES } from '../../../../shared/core/services';
import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { checklistItemText } from './checklist-item-text';
import { useSetupChecklist } from './use-setup-checklist';

// Where each kind of item is configured, for the kinds whose screen exists.
const CONFIGURED_AT: Partial<Record<ChecklistItem['kind'], string>> = {
  designation: '/admin/organisation/roles',
};

/** Brief 25 C6: every required setting, list and designation not yet configured, by service. */
export function SetupChecklistPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const checklist = useSetupChecklist();
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
      {services.length === 0 && <p>{admin.setupChecklist.complete}</p>}
      {services.map(({ slug }) => (
        <section key={slug} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{text.services[slug].name}</h2>
          <ul className="list-disc ps-6">
            {checklist.data
              .filter((item) => item.service === slug)
              .map((item) => {
                const label = checklistItemText(text, item);
                const to = CONFIGURED_AT[item.kind];
                return (
                  <li key={label}>
                    {to ? (
                      <Link to={to} className="underline">
                        {label}
                      </Link>
                    ) : (
                      label
                    )}
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
