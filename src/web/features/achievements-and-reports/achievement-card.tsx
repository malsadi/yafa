import type { AchievementRecord } from '../../../shared/achievements-and-reports/achievement-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { AchievementActions } from './achievement-actions';
import { AchievementPhotos } from './achievement-photos';

/** Brief 24 A1, A2: one achievement — its date, title, category, description, officers and photos. */
export function AchievementCard(props: {
  achievement: AchievementRecord;
  showUnit: boolean;
  editable: boolean;
}) {
  const t = useText().services['achievements-and-reports'].timeline;
  const date = useFormatDate();
  const { language } = useLanguage();
  const a = props.achievement;
  const ar = language === 'ar';
  return (
    <li
      className={`flex flex-col gap-1 rounded border p-3 ${a.withdrawnAt ? 'border-dashed opacity-70' : 'border-slate-300'}`}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm text-slate-600">{date(a.date)}</span>
        <h3 className="font-semibold">{a.title}</h3>
        <span className="rounded bg-slate-100 px-2 text-sm">
          {(ar ? a.categoryNameAr : a.categoryNameEn) ?? ''}
        </span>
        {props.showUnit && <span className="text-sm">{ar ? a.unitNameAr : a.unitNameEn}</span>}
        {a.withdrawnAt && <span className="text-sm font-medium">{t.withdrawn}</span>}
      </div>
      <p className="whitespace-pre-line">{a.description}</p>
      <p className="text-sm">
        {fillText(t.officers, {
          names: a.officers.map((o) => o.name ?? '').join(ar ? '، ' : ', '),
        })}
      </p>
      <AchievementPhotos achievement={a} editable={props.editable && !a.locked} />
      {a.locked && <p className="text-sm text-slate-600">{t.locked}</p>}
      {props.editable && !a.locked && <AchievementActions achievement={a} />}
    </li>
  );
}
