import type { HubRequestRecord } from '../../../shared/communication-hub/conversation-records';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** A request's subject, status, who asked when, and between which branches (20 B3). */
export function RequestHeading(props: { request: HubRequestRecord }) {
  const t = useText().services['communication-hub'].requests;
  const { language } = useLanguage();
  const formatTimestamp = useFormatTimestamp();
  const r = props.request;
  const name = (u: { nameEn: string; nameAr: string }) => (language === 'ar' ? u.nameAr : u.nameEn);
  const from =
    r.direction === 'sent'
      ? t.sent
      : fillText(t.received, {
          branch: name({ nameEn: r.fromUnitNameEn, nameAr: r.fromUnitNameAr }),
        });
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold">{r.subject}</h3>
        <span className="rounded bg-slate-200 px-2 text-xs">{t.statuses[r.status]}</span>
      </div>
      <p className="text-sm text-slate-600">
        {from} ·{' '}
        {fillText(t.askedBy, { name: r.createdByName, date: formatTimestamp(r.createdAt) })}
      </p>
      <p className="text-sm">
        {r.toAllBranches
          ? t.toAll
          : fillText(t.to, { branches: r.recipients.map(name).join(', ') })}
      </p>
      <p className="whitespace-pre-line">{r.body}</p>
    </>
  );
}
