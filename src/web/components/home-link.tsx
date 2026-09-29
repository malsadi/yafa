import { NavLink } from 'react-router';
import { useText } from '../app/language/use-text';

/** The way back to the home page, always at the start of the top bar. */
export function HomeLink() {
  const text = useText();
  return (
    <NavLink
      to="/"
      end
      className="me-auto rounded px-3 py-1 font-semibold aria-[current=page]:bg-slate-200"
    >
      {text.portalShell.navigation.home}
    </NavLink>
  );
}
