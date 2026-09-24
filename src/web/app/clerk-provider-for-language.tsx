import { ClerkProvider } from '@clerk/react';
import { arSA, enGB } from '@clerk/localizations';
import type { ReactNode } from 'react';
import type { Language } from '../../shared/core/languages';
import { useLanguage } from './language/use-language';

// Brief section 8.5: Clerk's screens use its Arabic localisation in Arabic;
// UK English otherwise (brief section 28).
const CLERK_LOCALIZATIONS: Record<Language, typeof enGB> = { en: enGB, ar: arSA };

export function ClerkProviderForLanguage(props: { publishableKey: string; children: ReactNode }) {
  const { language } = useLanguage();
  return (
    <ClerkProvider
      publishableKey={props.publishableKey}
      localization={CLERK_LOCALIZATIONS[language]}
    >
      {props.children}
    </ClerkProvider>
  );
}
