import { NavLink, Outlet } from 'react-router';
import { useText } from '../../app/language/use-text';
import { NotFoundPage } from '../../app/pages/not-found-page';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { PageHeading } from '../../components/page-heading';

const tab = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1 ${isActive ? 'bg-slate-800 text-white' : 'border border-slate-400'}`;

/** Brief 23: the selected unit's letters out and in. Switched off for it, the service is hidden (8.4). */
export function CorrespondenceLayout() {
  const t = useText().services['correspondence-and-letters'];
  const { unit } = useSelectedUnit();
  if (!unit?.enabledServices.includes('correspondence-and-letters')) return <NotFoundPage />;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{t.name}</PageHeading>
      <nav className="flex gap-2">
        <NavLink to="/correspondence-and-letters/letters-out" className={tab}>
          {t.tabs.out}
        </NavLink>
        <NavLink to="/correspondence-and-letters/letters-in" className={tab}>
          {t.tabs.in}
        </NavLink>
      </nav>
      <Outlet context={unit.id} />
    </div>
  );
}
