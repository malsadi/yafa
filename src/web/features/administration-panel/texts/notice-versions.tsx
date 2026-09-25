import type { TextsView } from '../../../../shared/administration-panel/texts';
import { buildDisplayLocale } from '../../../../shared/core/build-display-locale';
import { formatDateLondon } from '../../../../shared/core/format-date-london';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

/** Brief 13: every version of the privacy notice, newest (current) first, kept unchanged. */
export function NoticeVersions({ versions }: { versions: TextsView['privacyNotice'] }) {
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].texts;
  // D-048: Western digits until the administrator's digits setting exists.
  const locale = buildDisplayLocale(language, null);
  if (versions.length === 0) return <p className="text-amber-800">{t.noNotice}</p>;
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {versions.map((v, index) => (
        <li key={v.id}>
          {fillText(t.versionOn, {
            date: formatDateLondon(v.createdAt, locale, { dateStyle: 'long', timeStyle: 'short' }),
          })}
          {index === 0 && ` · ${t.current}`}
          {v.textAr === null && ` · ${t.arabicMissing}`}
        </li>
      ))}
    </ul>
  );
}
