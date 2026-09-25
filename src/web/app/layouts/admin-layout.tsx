import { NavLink, Outlet } from 'react-router';
import { LanguageSwitcher } from '../../components/language-switcher';
import { MaintenanceBanner } from '../../components/maintenance-banner';
import { SignOutControl } from '../../components/sign-out-control';
import { SiteFooter } from '../../components/site-footer';
import { NotFoundPage } from '../pages/not-found-page';
import { hasAdministrationCapability, heldAdminStages } from '../admin/admin-area-access';
import { ADMINISTRATION_PANEL_STAGES } from '../admin/administration-panel-stages';
import { useText } from '../language/use-text';
import { useChangeLanguage } from '../session/use-change-language';
import { useActiveSession } from '../session/use-active-session';

/**
 * The separate admin layout at `/admin` (brief section 25), shown only to
 * people with at least one administration capability.
 */
export function AdminLayout() {
  const session = useActiveSession();
  const text = useText();
  const changeLanguage = useChangeLanguage(true);
  if (!hasAdministrationCapability(session.context.capabilities)) {
    return <NotFoundPage />;
  }
  const adminText = text.services['administration-panel'];
  const held = heldAdminStages(session.context.capabilities);
  return (
    <div className="flex min-h-screen flex-col">
      {session.maintenanceMode && <MaintenanceBanner />}
      <header className="flex flex-wrap items-center gap-3 border-b-2 brand-rule px-4 py-3">
        <NavLink to="/" className="me-auto font-semibold">
          {adminText.name}
        </NavLink>
        <LanguageSwitcher onChange={(next) => void changeLanguage(next)} />
        <SignOutControl />
      </header>
      <nav aria-label={adminText.name} className="flex flex-wrap gap-2 border-b px-4 py-2">
        {ADMINISTRATION_PANEL_STAGES.filter((stage) => held.includes(stage)).map((stage) => (
          <NavLink
            key={stage}
            to={`/admin/${stage}`}
            className="rounded px-3 py-2 aria-[current=page]:bg-slate-200"
          >
            {adminText.stages[stage]}
          </NavLink>
        ))}
      </nav>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
