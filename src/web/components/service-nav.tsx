import { NavLink } from 'react-router';
import type { ServiceSlug } from '../../shared/core/services';
import { useText } from '../app/language/use-text';

/**
 * Navigation for every stage-one service switched on for the selected unit
 * (brief sections 8.4 and 26). The Administration panel has its own layout
 * and appears only for people with an administration capability.
 */
export function ServiceNav(props: { services: ServiceSlug[]; showAdministration: boolean }) {
  const text = useText();
  const portalServices = props.services.filter((slug) => slug !== 'administration-panel');
  return (
    <nav aria-label={text.portalShell.navigation.label}>
      <ul className="flex flex-col gap-1">
        {portalServices.map((slug) => (
          <li key={slug}>
            <NavLink
              to={`/${slug}`}
              className="block rounded px-3 py-2 aria-[current=page]:bg-slate-200"
            >
              {text.services[slug].name}
            </NavLink>
          </li>
        ))}
        {props.showAdministration && (
          <li>
            <NavLink
              to="/admin"
              className="block rounded px-3 py-2 aria-[current=page]:bg-slate-200"
            >
              {text.portalShell.navigation.administration}
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}
