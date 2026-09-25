import { useQuery } from '@tanstack/react-query';
import type {
  NamedChoice,
  ServiceSettingView,
} from '../../../../shared/administration-panel/service-settings';
import { useApiRequest } from '../../../app/api/use-api-request';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { settingValueText } from '../setting-editor/setting-value-text';
import { HistoryEntryRow } from './history-entry-row';
import { fetchSettingHistory } from './service-settings.api';
import { useScopeName } from './use-scope-name';

interface SettingHistoryProps {
  setting: ServiceSettingView;
  units: readonly NamedChoice[];
  roles: readonly NamedChoice[];
  busy: boolean;
  onRestore: (historyId: string) => void;
}

/** Brief 8.1: every change to one setting, newest first, each earlier one restorable. */
export function SettingHistory({ setting, units, roles, busy, onRestore }: SettingHistoryProps) {
  const request = useApiRequest();
  const { language } = useLanguage();
  const text = useText();
  const t = text.services['administration-panel'].serviceSettings;
  const scopeName = useScopeName(units);
  const history = useQuery({
    queryKey: ['service-settings', setting.key, 'history', setting.national, setting.overrides],
    queryFn: () => fetchSettingHistory(request, setting.key),
  });
  if (!history.data) return null;
  if (history.data.length === 0) return <p className="text-sm">{t.noHistory}</p>;
  const shown = (value: unknown) =>
    value === null
      ? t.overrideRemoved
      : settingValueText(text, language, {
          settingKey: setting.key,
          input: setting.input,
          value,
          roles,
        });
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {history.data.map((entry, index) => (
        <HistoryEntryRow
          key={entry.id}
          entry={entry}
          scope={scopeName(entry.scope)}
          value={shown(entry.newValue)}
          canRestore={index > 0}
          busy={busy}
          onRestore={() => {
            onRestore(entry.id);
          }}
        />
      ))}
    </ul>
  );
}
