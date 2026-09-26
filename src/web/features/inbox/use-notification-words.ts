import type { InboxItem } from '../../../shared/core/inbox';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** A notification in the officer's words: its kind's text with its details, or a plain one for a kind not known here. */
export function useNotificationWords(): (item: InboxItem) => string {
  const t = useText().portalShell.inbox;
  const kinds: Partial<Record<string, string>> = t.kinds;
  return (item) => {
    const text = kinds[item.kind];
    return text ? fillText(text, item.params ?? {}) : t.unknown;
  };
}
