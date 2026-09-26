import { NavLink, Outlet } from 'react-router';
import { useText } from '../../app/language/use-text';
import { NotFoundPage } from '../../app/pages/not-found-page';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { PageHeading } from '../../components/page-heading';

/** Brief 17: the Treasury of the selected unit. Switched off for it, the Treasury is hidden (8.4). */
export function TreasuryLayout() {
  const text = useText();
  const t = text.services.treasury.accounts.sections;
  const { unit } = useSelectedUnit();
  if (!unit?.enabledServices.includes('treasury')) return <NotFoundPage />;
  const sections = [
    ['accounts', t.accounts],
    ['approvals', t.approvals],
    ['years', t.years],
  ] as const;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{text.services.treasury.name}</PageHeading>
      <nav aria-label={t.label}>
        <ul className="flex flex-wrap gap-2">
          {sections.map(([path, label]) => (
            <li key={path}>
              <NavLink
                to={`/treasury/${path}`}
                end
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
