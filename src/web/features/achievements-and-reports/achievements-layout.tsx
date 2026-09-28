import { NavLink, Outlet } from 'react-router';
import { useText } from '../../app/language/use-text';
import { NotFoundPage } from '../../app/pages/not-found-page';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { PageHeading } from '../../components/page-heading';

const tab = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1 ${isActive ? 'bg-slate-800 text-white' : 'border border-slate-400'}`;
const BASE = '/achievements-and-reports';

/** Brief 24: the selected unit's timeline, contributions and annual reports. Switched off, it is hidden (8.4). */
export function AchievementsLayout() {
  const t = useText().services['achievements-and-reports'];
  const { unit } = useSelectedUnit();
  if (!unit?.enabledServices.includes('achievements-and-reports')) return <NotFoundPage />;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{t.name}</PageHeading>
      <nav className="flex flex-wrap gap-2">
        <NavLink to={`${BASE}/timeline`} className={tab}>
          {t.tabs.timeline}
        </NavLink>
        <NavLink to={`${BASE}/contributions`} className={tab}>
          {t.tabs.contributions}
        </NavLink>
        <NavLink to={`${BASE}/annual-reports`} className={tab}>
          {t.tabs.reports}
        </NavLink>
      </nav>
      <Outlet context={{ unitId: unit.id, isNational: unit.type === 'national' }} />
    </div>
  );
}
