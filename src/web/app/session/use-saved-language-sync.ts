import { useEffect } from 'react';
import type { MeResponse } from '../../../shared/core/me-response';
import { useLanguage } from '../language/use-language';

/**
 * Brief section 8.5: the officer's saved language is used on every device.
 * Once `/api/me` reports one, the interface switches to it. With none saved
 * yet, the browser's language stays in place (T-068, O-018).
 */
export function useSavedLanguageSync(me: MeResponse | undefined): void {
  const { setLanguage } = useLanguage();
  const saved = me && me.status !== 'not-active' ? me.language : null;
  useEffect(() => {
    if (saved) {
      setLanguage(saved);
    }
  }, [saved, setLanguage]);
}
