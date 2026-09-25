import { Link } from 'react-router';
import { useText } from '../app/language/use-text';

/** Brief 13 and D-083: the privacy notice and the Help page, from the footer. */
export function SiteFooter() {
  const text = useText();
  return (
    <footer className="border-t px-4 py-3 text-sm">
      <nav className="flex flex-wrap gap-4">
        <Link to="/privacy-notice" className="underline">
          {text.portalShell.footer.privacyNotice}
        </Link>
        <Link to="/help" className="underline">
          {text.portalShell.footer.help}
        </Link>
      </nav>
    </footer>
  );
}
