import type { HandoverRecord } from '../../../../shared/committee-register/handover-record';
import { buildDisplayLocale } from '../../../../shared/core/build-display-locale';
import { formatDateLondon } from '../../../../shared/core/format-date-london';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { PageHeading } from '../../../components/page-heading';
import { handoverStatus } from './handover-status';

/** Brief 14 C2: who hands over which role to whom, and each officer's confirmation. */
export function HandoverHeader({ handover }: { handover: HandoverRecord }) {
  const { language } = useLanguage();
  const t = useText().services['committee-register'].handovers;
  // D-048: Western digits until the administrator's digits setting exists.
  const locale = buildDisplayLocale(language, null);
  const when = (at: string | null, name: string) =>
    at
      ? fillText(t.confirmedBy, {
          name,
          date: formatDateLondon(at, locale, { dateStyle: 'long', timeStyle: 'short' }),
        })
      : fillText(t.notYetConfirmed, { name });
  return (
    <div className="flex flex-col gap-1">
      <PageHeading>
        {fillText(t.summary, {
          role: { en: handover.roleNameEn, ar: handover.roleNameAr }[language],
          outgoing: handover.outgoingName,
          incoming: handover.incomingName,
        })}
      </PageHeading>
      <p>
        {{ en: handover.unitNameEn, ar: handover.unitNameAr }[language]} ·{' '}
        {t.statuses[handoverStatus(handover)]}
      </p>
      <p className="text-sm">{when(handover.outgoingConfirmedAt, handover.outgoingName)}</p>
      <p className="text-sm">{when(handover.incomingConfirmedAt, handover.incomingName)}</p>
    </div>
  );
}
