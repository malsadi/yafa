import type { CurrentOfficerRecord } from '../../../../shared/committee-register/officer-record';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { useFormatDate } from '../../../app/language/use-format-date';

/** Brief 14 B1 and B3: who holds which role, their contact details and term dates. */
export function OfficerSummary({ officer }: { officer: CurrentOfficerRecord }) {
  const { language } = useLanguage();
  const t = useText().services['committee-register'].register;
  const formatDate = useFormatDate();
  const start = formatDate(officer.startDate);
  const dates = officer.endDate
    ? fillText(t.fromTo, { start, end: formatDate(officer.endDate) })
    : fillText(t.from, { start });
  return (
    <>
      <p className="font-medium">
        {officer.name} · {{ en: officer.roleNameEn, ar: officer.roleNameAr }[language]}
        {officer.endingSoon && (
          <span className="ms-2 rounded bg-amber-200 px-2 text-sm">{t.endingSoon}</span>
        )}
      </p>
      <p className="text-sm text-slate-600">
        {officer.email} · {officer.phone} · {dates}
      </p>
    </>
  );
}
