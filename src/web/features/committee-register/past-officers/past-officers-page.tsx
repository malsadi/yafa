import { useQuery } from '@tanstack/react-query';
import { StatusMessage } from '../../../components/status-message';
import { useApiRequest } from '../../../app/api/use-api-request';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { fetchPastOfficers } from '../officers/officers.api';
import { useFormatDate } from '../use-format-date';
import { useRegisterUnit } from '../use-register-unit';

/** Brief 14 C3: officers whose term has ended, with role and dates — the unit's history. */
export function PastOfficersPage() {
  const unit = useRegisterUnit();
  const request = useApiRequest();
  const { language } = useLanguage();
  const text = useText();
  const t = text.services['committee-register'].register;
  const formatDate = useFormatDate();
  const past = useQuery({
    queryKey: ['committee-register', unit.id, 'past-officers'],
    queryFn: () => fetchPastOfficers(request, unit.id),
  });
  if (past.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (past.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  if (past.data.length === 0) return <p>{t.noPastOfficers}</p>;
  return (
    <ul className="flex flex-col gap-2">
      {past.data.map((officer) => (
        <li key={officer.termId} className="rounded border border-slate-300 p-3">
          <p className="font-medium">
            {officer.name} · {{ en: officer.roleNameEn, ar: officer.roleNameAr }[language]}
          </p>
          <p className="text-sm text-slate-600">
            {fillText(t.fromTo, {
              start: formatDate(officer.startDate),
              end: officer.endDate ? formatDate(officer.endDate) : '',
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}
