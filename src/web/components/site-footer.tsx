import { Link } from 'react-router';
import { useText } from '../app/language/use-text';

/** Brief section 13: the privacy notice is available from the footer. */
export function SiteFooter() {
  const text = useText();
  return (
    <footer className="border-t px-4 py-3 text-sm">
      <Link to="/privacy-notice" className="underline">
        {text.portalShell.footer.privacyNotice}
      </Link>
    </footer>
  );
}
