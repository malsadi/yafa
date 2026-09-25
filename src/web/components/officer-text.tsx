import { useLanguage } from '../app/language/use-language';
import { inLanguage } from '../app/language/in-language';
import { useText } from '../app/language/use-text';
import { useOfficerText } from '../app/session/use-officer-text';
import { StatusMessage } from './status-message';

/**
 * An administrator's text in the officer's language — English while the
 * Arabic isn't written (D-022) — shown as typed, with its own direction.
 * Until it is written, it says it isn't set up (rule 5).
 */
export function OfficerText({ textKey }: { textKey: 'access-not-active' | 'help' }) {
  const { language } = useLanguage();
  const text = useText();
  const written = useOfficerText(textKey);
  if (written.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (written.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  if (!written.data) return <p>{text.portalShell.notConfigured}</p>;
  return (
    <div dir="auto" className="whitespace-pre-wrap">
      {inLanguage(written.data, language)}
    </div>
  );
}
