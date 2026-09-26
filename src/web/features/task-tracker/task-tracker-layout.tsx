import { NavLink, Outlet } from 'react-router';
import { useText } from '../../app/language/use-text';
import { NotFoundPage } from '../../app/pages/not-found-page';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { PageHeading } from '../../components/page-heading';

/** Brief 18: My tasks and the selected unit's action list. Switched off for it, the tracker is hidden (8.4). */
export function TaskTrackerLayout() {
  const text = useText();
  const t = text.services['task-tracker'];
  const { unit } = useSelectedUnit();
  if (!unit?.enabledServices.includes('task-tracker')) return <NotFoundPage />;
  const sections = [
    ['mine', t.sections.mine],
    ['action-list', t.sections.actionList],
  ] as const;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{t.name}</PageHeading>
      <nav aria-label={t.sections.label}>
        <ul className="flex flex-wrap gap-2">
          {sections.map(([path, label]) => (
            <li key={path}>
              <NavLink
                to={`/task-tracker/${path}`}
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
