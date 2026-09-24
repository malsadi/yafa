import { PageHeading } from '../../components/page-heading';
import { LanguageSwitcher } from '../../components/language-switcher';
import { SignOutControl } from '../../components/sign-out-control';
import { useLanguage } from '../language/use-language';
import { useText } from '../language/use-text';

/**
 * Brief section 6.2: a signed-in user with no linked person holding a
 * current term sees only this page; D-024: so does everyone while no
 * privacy notice is set. Its message is an administrator text (15 C5,
 * Phase 2) — until that exists, the page says it is not set up (rule 5).
 * The language switch is not saved: there may be no person record to save to.
 */
export function AccessNotActivePage() {
  const text = useText();
  const { setLanguage } = useLanguage();
  return (
    <main className="mx-auto flex max-w-prose flex-col gap-4 p-6">
      <LanguageSwitcher onChange={setLanguage} />
      <PageHeading>{text.portalShell.accessNotActive.title}</PageHeading>
      <p>{text.portalShell.notConfigured}</p>
      <div>
        <SignOutControl />
      </div>
    </main>
  );
}
