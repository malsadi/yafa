import { NavLink, Outlet } from 'react-router';
import { useText } from '../../app/language/use-text';
import { NotFoundPage } from '../../app/pages/not-found-page';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { PageHeading } from '../../components/page-heading';

/** Brief 20: the selected unit's Communication hub. Switched off for it, the hub is hidden (8.4). */
export function CommunicationHubLayout() {
  const t = useText().services['communication-hub'];
  const { unit } = useSelectedUnit();
  if (!unit?.enabledServices.includes('communication-hub')) return <NotFoundPage />;
  const sections = [
    ['noticeboard', t.sections.noticeboard],
    ['circulars', t.sections.circulars],
    ['role-networks', t.sections.roleNetworks],
    ['discussions', t.sections.discussions],
    ['requests', t.sections.requests],
  ] as const;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{t.name}</PageHeading>
      <nav aria-label={t.sections.label}>
        <ul className="flex flex-wrap gap-2">
          {sections.map(([path, label]) => (
            <li key={path}>
              <NavLink
                to={`/communication-hub/${path}`}
                className="block rounded px-3 py-1 aria-[current=page]:bg-slate-200"
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet context={unit} />
    </div>
  );
}
