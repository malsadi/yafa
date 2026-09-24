import { UserProfile } from '@clerk/react';
import { LanguageSwitcher } from '../../components/language-switcher';
import { PageHeading } from '../../components/page-heading';
import { SignOutControl } from '../../components/sign-out-control';
import { useText } from '../language/use-text';
import { useChangeLanguage } from '../session/use-change-language';

/**
 * Brief 6.3 (T-077): system administrators always use multi-factor. A
 * session without a second factor sees only this page, with Clerk's own
 * profile panel to set it up; signing in again then verifies it.
 */
export function SecondFactorRequiredPage() {
  const text = useText();
  const changeLanguage = useChangeLanguage(true);
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <LanguageSwitcher onChange={(next) => void changeLanguage(next)} />
      <PageHeading>{text.portalShell.secondFactorRequired.title}</PageHeading>
      <p>{text.portalShell.secondFactorRequired.explanation}</p>
      <UserProfile routing="hash" />
      <div>
        <SignOutControl />
      </div>
    </main>
  );
}
