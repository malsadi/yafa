import { SERVICES } from '../../../../shared/core/services';
import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { removeOverride, restoreSetting, setSetting } from './service-settings.api';
import { SettingCard } from './setting-card';
import { useServiceSettings } from './use-service-settings';

/** Brief 25 C1: every registered setting, grouped by service in the brief's order. */
export function ServiceSettingsPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const { view, change, refusal } = useServiceSettings();
  if (view.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (view.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const { settings, units, roles } = view.data;
  const services = SERVICES.filter((s) => settings.some((setting) => setting.service === s.slug));
  return (
    <div className="flex flex-col gap-6">
      <div>
        <PageHeading>{admin.screens['service-settings']}</PageHeading>
        <p className="max-w-prose">{admin.serviceSettings.intro}</p>
      </div>
      {services.map(({ slug }) => (
        <section key={slug} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{text.services[slug].name}</h2>
          <ul className="flex flex-col gap-2">
            {settings
              .filter((setting) => setting.service === slug)
              .map((setting) => {
                const { key } = setting;
                return (
                  <SettingCard
                    key={key}
                    setting={setting}
                    units={units}
                    roles={roles}
                    refusal={refusal?.key === key ? refusal.code : null}
                    busy={change.isPending}
                    onSet={(value, unitId) => {
                      change.mutate({ key, run: (r) => setSetting(r, key, value, unitId) });
                    }}
                    onRemoveOverride={(unitId) => {
                      change.mutate({ key, run: (r) => removeOverride(r, key, unitId) });
                    }}
                    onRestore={(historyId) => {
                      change.mutate({ key, run: (r) => restoreSetting(r, key, historyId) });
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
