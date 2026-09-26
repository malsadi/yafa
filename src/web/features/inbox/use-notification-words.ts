import type { InboxItem } from '../../../shared/core/inbox';
import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/**
 * A notification in the officer's words: its kind's text with its details
 * — a detail named `…Date` written as a date in their language — or a plain
 * one for a kind not known here.
 */
export function useNotificationWords(): (item: InboxItem) => string {
  const t = useText().portalShell.inbox;
  const formatDate = useFormatDate();
  const kinds: Partial<Record<string, string>> = t.kinds;
  return (item) => {
    const text = kinds[item.kind];
    if (!text) return t.unknown;
    const params = Object.fromEntries(
      Object.entries(item.params ?? {}).map(([key, value]) => [
        key,
        key.endsWith('Date') && typeof value === 'string' ? formatDate(value) : value,
      ]),
    );
    return fillText(text, params);
  };
}
