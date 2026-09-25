import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { ServiceSwitchCard } from './service-switch-card';
import { useServiceSwitches } from './use-service-switches';

/** Brief 25 C2: every service, on or off portal-wide or per unit. Switching never deletes data. */
export function ServiceSwitchesPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const { view, change, refusal } = useServiceSwitches();
  if (view.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (view.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <PageHeading>{admin.screens['service-switches']}</PageHeading>
        <p className="max-w-prose">{admin.serviceSwitches.intro}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {view.data.services.map((service) => (
          <ServiceSwitchCard
            key={service.slug}
            service={service}
            rows={view.data.rows}
            units={view.data.units}
            refusal={refusal?.service === service.slug ? refusal.code : null}
            busy={change.isPending}
            onChange={(enabled, unitId) => {
              change.mutate({ service: service.slug, enabled, unitId });
            }}
          />
        ))}
      </ul>
    </div>
  );
}
