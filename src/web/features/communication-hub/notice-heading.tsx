import type { NoticeRecord } from '../../../shared/communication-hub/notice-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { titleInLanguage } from '../../app/language/title-in-language';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** A notice's title and who posted it when — or, for an automatic post, what it announces, marked as automatic (20 A1). */
export function NoticeHeading(props: { notice: NoticeRecord }) {
  const t = useText().services['communication-hub'].noticeboard;
  const formatDate = useFormatDate();
  const formatTimestamp = useFormatTimestamp();
  const { language } = useLanguage();
  const { notice } = props;
  if (notice.source === 'automatic' && notice.automaticKind) {
    const date = notice.aboutDate ? formatDate(notice.aboutDate) : '';
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-slate-200 px-2 text-xs">{t.automatic}</span>
        <h3 className="font-semibold">
          {fillText(t.automaticKinds[notice.automaticKind], {
            title: titleInLanguage(notice, language),
            date,
          })}
        </h3>
        <span className="text-sm text-slate-600">{formatTimestamp(notice.createdAt)}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <h3 className="font-semibold">{notice.title}</h3>
      <span className="text-sm text-slate-600">
        {fillText(t.postedBy, {
          name: notice.postedByName ?? '',
          date: formatTimestamp(notice.createdAt),
        })}
      </span>
    </div>
  );
}
