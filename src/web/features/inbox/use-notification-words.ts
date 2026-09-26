import type { InboxItem } from '../../../shared/core/inbox';
import { useFormatDate } from '../../app/language/use-format-date';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/**
 * A notification in the officer's words: its kind's text with its details
 * — a detail named `…Date` written as a date in their language, and a pair
 * named `…En` and `…Ar` given in their language — or a plain one for a kind
 * not known here.
 */
export function useNotificationWords(): (item: InboxItem) => string {
  const t = useText().portalShell.inbox;
  const { language } = useLanguage();
  const formatDate = useFormatDate();
  const kinds: Partial<Record<string, string>> = t.kinds;
  const suffix = language === 'ar' ? 'Ar' : 'En';
  return (item) => {
    const text = kinds[item.kind];
    if (!text) return t.unknown;
    const params: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(item.params ?? {})) {
      if (typeof value !== 'string' && typeof value !== 'number') continue;
      if (key.endsWith(suffix)) params[key.slice(0, -2)] = value;
      else if (key.endsWith('Date') && typeof value === 'string') params[key] = formatDate(value);
      else params[key] = value;
    }
    return fillText(text, params);
  };
}
