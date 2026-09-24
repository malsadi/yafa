import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { LanguageContext } from './language-context';
import { applyDocumentLanguage } from './apply-document-language';
import { detectBrowserLanguage } from './detect-browser-language';

/**
 * Holds the language the whole interface is shown in. Starts from the
 * browser (brief section 8.5, before sign-in); the session shell replaces
 * it with the officer's saved choice once it is known.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(() => detectBrowserLanguage(navigator.languages));

  useLayoutEffect(() => {
    applyDocumentLanguage(document.documentElement, language);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext value={value}>{children}</LanguageContext>;
}
