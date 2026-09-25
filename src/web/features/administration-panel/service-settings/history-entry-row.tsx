import type { SettingHistoryEntry } from '../../../../shared/administration-panel/service-settings';
import { buildDisplayLocale } from '../../../../shared/core/build-display-locale';
import { formatDateLondon } from '../../../../shared/core/format-date-london';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

interface HistoryEntryRowProps {
  entry: SettingHistoryEntry;
  scope: string;
  value: string;
  canRestore: boolean;
  busy: boolean;
  onRestore: () => void;
}

/** One change: when, where, by whom, and the value set — restorable unless it is the latest. */
export function HistoryEntryRow({
  entry,
  scope,
  value,
  canRestore,
  busy,
  onRestore,
}: HistoryEntryRowProps) {
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].serviceSettings;
  // D-048: Western digits until the administrator's digits setting exists.
  const locale = buildDisplayLocale(language, null);
  const date = formatDateLondon(entry.changedAt, locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  return (
    <li className="flex flex-wrap items-center gap-2">
      {fillText(t.historyEntry, { date, scope, name: entry.changedByName, value })}
      {canRestore && (
        <button type="button" className="underline" disabled={busy} onClick={onRestore}>
          {t.restore}
        </button>
      )}
    </li>
  );
}
