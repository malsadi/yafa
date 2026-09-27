import { NavLink, Outlet } from 'react-router';
import { useText } from '../../app/language/use-text';
import { NotFoundPage } from '../../app/pages/not-found-page';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { PageHeading } from '../../components/page-heading';

/** Brief 21: the selected unit's events and templates. Switched off for it, the service is hidden (8.4). */
export function EventOrganiserLayout() {
  const t = useText().services['event-organiser'];
  const { unit } = useSelectedUnit();
  if (!unit?.enabledServices.includes('event-organiser')) return <NotFoundPage />;
  const sections = [
    ['events', t.sections.events],
    ['templates', t.sections.templates],
  ] as const;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{t.name}</PageHeading>
      <nav aria-label={t.sections.label}>
        <ul className="flex flex-wrap gap-2">
          {sections.map(([path, label]) => (
            <li key={path}>
              <NavLink
                to={`/event-organiser/${path}`}
                end={path === 'templates'}
                className="block rounded px-3 py-1 aria-[current=page]:bg-slate-200"
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet context={unit.id} />
    </div>
  );
}
