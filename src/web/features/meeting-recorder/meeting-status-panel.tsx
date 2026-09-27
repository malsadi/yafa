import type { MeetingDetail } from '../../../shared/meeting-recorder/meeting-records';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { ActionButton } from '../../components/action-button';
import { ErrorAlert } from '../../components/error-alert';
import { CancelMeetingControl } from './cancel-meeting-control';
import { ReportDownload } from './report-download';
import { useMeetingHints } from './meeting-hints';
import { meetingPath } from './meeting-recorder.api';
import { useMeetingAction } from './use-meeting-action';

/**
 * D-201, D-202 and D-208: marking the meeting held, cancelling it, logging
 * its report (in this officer's language), and downloading it once logged.
 */
export function MeetingStatusPanel({ detail }: { detail: MeetingDetail }) {
  const t = useText().services['meeting-recorder'];
  const { language } = useLanguage();
  const { meeting } = detail;
  const hints = useMeetingHints(meeting);
  const act = useMeetingAction();
  const base = meetingPath(meeting.unitId, meeting.id);
  const post = (action: string, body: object) => () => {
    act.mutate({
      path: `${base}/${action}`,
      method: 'POST',
      body: { ...body, version: meeting.version },
    });
  };
  return (
    <section className="flex flex-col gap-2">
      <ErrorAlert error={act.error} refusals={t.refusals} />
      <div className="flex flex-wrap gap-2">
        {hints.holds && (
          <ActionButton
            primary
            label={t.status.hold}
            disabled={act.isPending}
            onClick={post('hold', {})}
          />
        )}
        {hints.records && (
          <ActionButton
            primary
            label={t.status.log}
            disabled={act.isPending}
            onClick={post('log-report', { language })}
          />
        )}
        {meeting.status === 'Report logged' && <ReportDownload meeting={meeting} />}
      </div>
      {hints.sets && <CancelMeetingControl meeting={meeting} />}
    </section>
  );
}
