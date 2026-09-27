import { ClerkProvider } from '@clerk/react';
import { arSA, enGB } from '@clerk/localizations';
import type { ReactNode } from 'react';
import type { Language } from '../../shared/core/languages';
import { useLanguage } from './language/use-language';

// Brief section 8.5: Clerk's screens use its Arabic localisation in Arabic;
// UK English otherwise (brief section 28).
const CLERK_LOCALIZATIONS: Record<Language, typeof enGB> = { en: enGB, ar: arSA };

// T-153: Clerk's usage telemetry is off. Its host is outside the security
// policy (brief 12: own origin plus the Clerk hosts Clerk requires), so the
// browser would block it anyway; turning it off means it is never tried.

export function ClerkProviderForLanguage(props: { publishableKey: string; children: ReactNode }) {
  const { language } = useLanguage();
  return (
    <ClerkProvider
      publishableKey={props.publishableKey}
      localization={CLERK_LOCALIZATIONS[language]}
      telemetry={false}
    >
      {props.children}
    </ClerkProvider>
  );
}
