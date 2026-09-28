import { useParams } from 'react-router';
import { useFormatDate } from '../../app/language/use-format-date';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { fillText } from '../../text/fill-text';
import { useAchievementUnit, useContribution } from './use-achievement-queries';

/** Brief 24 B1 and O-153: one person's roles held, with dates, and the achievements credited to them. */
export function ContributionPage() {
  const { unitId } = useAchievementUnit();
  const { personId = '' } = useParams();
  const text = useText();
  const t = text.services['achievements-and-reports'].contributions;
  const refusals = text.services['achievements-and-reports'].refusals;
  const date = useFormatDate();
  const ar = useLanguage().language === 'ar';
  const c = useContribution(unitId, personId);
  if (c.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (c.isError) return <ErrorAlert error={c.error} refusals={refusals} />;
  return (
    <article className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{c.data.name ?? ''}</h2>
      <h3 className="font-semibold">{t.roles}</h3>
      <ul className="flex flex-col gap-1 text-sm">
        {c.data.terms.map((term) => (
          <li key={`${term.roleNameEn}-${term.startDate}`}>
            {fillText(t.term, {
              role: ar ? term.roleNameAr : term.roleNameEn,
              unit: ar ? term.unitNameAr : term.unitNameEn,
              start: date(term.startDate),
              end: term.endDate ? date(term.endDate) : t.toDate,
            })}
          </li>
        ))}
      </ul>
      <h3 className="font-semibold">{t.achievements}</h3>
      {c.data.achievements.length === 0 && <p className="text-sm">{t.noAchievements}</p>}
      <ul className="flex flex-col gap-1 text-sm">
        {c.data.achievements.map((a) => (
          <li key={a.id}>
            {fillText(t.achievement, {
              date: date(a.date),
              title: a.title,
              category: (ar ? a.categoryNameAr : a.categoryNameEn) ?? '',
            })}
          </li>
        ))}
      </ul>
    </article>
  );
}
