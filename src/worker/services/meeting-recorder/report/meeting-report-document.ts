import { buildDisplayLocale } from '../../../../shared/core/build-display-locale';
import { formatDateLondon } from '../../../../shared/core/format-date-london';
import type { Language } from '../../../../shared/core/languages';
import type { AgendaItemRecord } from '../../../../shared/meeting-recorder/meeting-records';
import type { MeetingReport } from '../../../../shared/meeting-recorder/meeting-report';
import type { MeetingReportDocument } from '../../../../pdf-templates/meeting-report/meeting-report-document';
import { getTextBundle } from '../../../../web/text';
import { fillText } from '../../../../web/text/fill-text';

type Labels = ReturnType<typeof getTextBundle>['services']['meeting-recorder']['reportPdf'];

/** D-206: an item's vote or decision, in words. */
function outcomeText(item: AgendaItemRecord, t: Labels): string {
  if (item.outcomeKind === 'decision')
    return fillText(t.decision, { decision: item.decision ?? '' });
  return fillText(t.vote, {
    for: String(item.votesFor ?? 0),
    against: String(item.votesAgainst ?? 0),
    abstain: String(item.votesAbstain ?? 0),
    result: item.voteResult ?? '',
  });
}

/** Brief 22 C1 and D-208: the report written out in the logging officer's language. */
export function meetingReportDocument(
  report: MeetingReport,
  params: { language: Language; organisationName: string; unitName: string },
): MeetingReportDocument {
  const bundle = getTextBundle(params.language).services['meeting-recorder'];
  const t = bundle.reportPdf;
  const { meeting, attendees, agenda } = report;
  const locale = buildDisplayLocale(params.language, null);
  const date = formatDateLondon(`${meeting.date}T12:00:00Z`, locale, { dateStyle: 'long' });
  const title = (item: AgendaItemRecord) =>
    item.raisedInMeeting ? fillText(t.raised, { title: item.title }) : item.title;
  return {
    language: params.language,
    organisationName: params.organisationName,
    unitName: params.unitName,
    title: fillText(t.title, {
      type: params.language === 'ar' ? meeting.typeNameAr : meeting.typeNameEn,
    }),
    details: [
      fillText(t.when, { date, time: meeting.startTime }),
      ...(meeting.place ? [fillText(t.place, { place: meeting.place })] : []),
      ...(meeting.onlineLink ? [fillText(t.link, { link: meeting.onlineLink })] : []),
      fillText(t.chair, { name: meeting.chairName ?? '' }),
      fillText(t.secretary, { name: meeting.secretaryName ?? '' }),
    ],
    attendance: {
      heading: t.attendance,
      rows: attendees.map((a) => ({
        name: a.name ?? '',
        mark: a.attendance ? bundle.attendance[a.attendance] : t.notMarked,
      })),
    },
    originalAgenda: {
      heading: t.originalAgenda,
      items: agenda.filter((i) => !i.raisedInMeeting).map((i) => i.title),
    },
    updatedAgenda: { heading: t.updatedAgenda, items: agenda.map(title) },
    minutes: {
      heading: t.minutes,
      items: agenda.map((item) => ({
        title: title(item),
        comments: item.comments.map((c) => ({ name: c.name ?? '', comment: c.comment })),
        outcome: outcomeText(item, t),
      })),
    },
  };
}
