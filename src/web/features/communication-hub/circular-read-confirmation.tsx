import type { SentCircular } from '../../../shared/communication-hub/circular-records';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** Brief 20 A4 and P14: how many of the branches have opened the circular, and each one's first opening. */
export function CircularReadConfirmation(props: { circular: SentCircular }) {
  const t = useText().services['communication-hub'].circulars;
  const { language } = useLanguage();
  const formatTimestamp = useFormatTimestamp();
  const { recipients } = props.circular;
  const opened = recipients.filter((r) => r.openedAt !== null).length;
  return (
    <details>
      <summary className="cursor-pointer text-sm font-medium">
        {fillText(t.openedCount, { opened, total: recipients.length })}
      </summary>
      <ul className="text-sm">
        {recipients.map((r) => (
          <li key={r.unitId}>
            {language === 'ar' ? r.nameAr : r.nameEn}:{' '}
            {r.openedAt
              ? fillText(t.branchOpened, { date: formatTimestamp(r.openedAt) })
              : t.branchNotOpened}
          </li>
        ))}
      </ul>
    </details>
  );
}
