import { Outlet } from 'react-router';
import { LanguageSwitcher } from '../../components/language-switcher';
import { MaintenanceBanner } from '../../components/maintenance-banner';
import { ServiceNav } from '../../components/service-nav';
import { SignOutControl } from '../../components/sign-out-control';
import { SiteFooter } from '../../components/site-footer';
import { UnitSwitcher } from '../../components/unit-switcher';
import { hasAdministrationCapability } from '../admin/administration-panel-stages';
import { useChangeLanguage } from '../session/use-change-language';
import { useActiveSession } from '../session/use-active-session';
import { useSelectedUnit } from '../unit/use-selected-unit';

/** The officer's portal: header controls, service navigation, page, footer. */
export function PortalLayout() {
  const session = useActiveSession();
  const { unit } = useSelectedUnit();
  const changeLanguage = useChangeLanguage(true);
  return (
    <div className="flex min-h-screen flex-col">
      {session.maintenanceMode && <MaintenanceBanner />}
      <header className="flex flex-wrap items-center justify-end gap-3 border-b px-4 py-3">
        <UnitSwitcher units={session.units} />
        <LanguageSwitcher onChange={(next) => void changeLanguage(next)} />
        <SignOutControl />
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-b p-3 md:w-64 md:border-e md:border-b-0">
          <ServiceNav
            services={unit?.enabledServices ?? []}
            showAdministration={hasAdministrationCapability(session.context.capabilities)}
          />
        </aside>
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
