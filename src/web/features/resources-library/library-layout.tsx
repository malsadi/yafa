import { NavLink, Outlet } from 'react-router';
import { useText } from '../../app/language/use-text';
import { NotFoundPage } from '../../app/pages/not-found-page';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { PageHeading } from '../../components/page-heading';

/**
 * Brief 16: the library's sections for the selected unit. Switched off for
 * that unit, the library is hidden (8.4).
 */
export function LibraryLayout() {
  const text = useText();
  const t = text.services['resources-library'];
  const { unit } = useSelectedUnit();
  if (!unit?.enabledServices.includes('resources-library')) return <NotFoundPage />;
  // Brief 16's order: Templates, Guides, Venues, Equipment, Correspondence.
  const sections = [
    ['templates', t.sections.templates],
    ['guides', t.sections.guides],
    ['venues', t.sections.venues],
    ['equipment', t.sections.equipment],
    ['letter-templates', t.sections.letterTemplates],
    ['letters-out', t.sections.lettersOut],
    ['letters-in', t.sections.lettersIn],
  ] as const;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{t.name}</PageHeading>
      <nav aria-label={t.sections.label}>
        <ul className="flex flex-wrap gap-2">
          {sections.map(([path, label]) => (
            <li key={path}>
              <NavLink
                to={`/resources-library/${path}`}
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
