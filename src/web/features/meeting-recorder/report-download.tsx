import { useAuth } from '@clerk/react';
import { useMutation } from '@tanstack/react-query';
import type { MeetingSummary } from '../../../shared/meeting-recorder/meeting-records';
import { downloadFile } from '../../app/files/download-file';
import { useText } from '../../app/language/use-text';
import { ActionButton } from '../../components/action-button';
import { ErrorAlert } from '../../components/error-alert';
import { meetingPath } from './meeting-recorder.api';

/** Brief 22 C1: the logged report's PDF, saved to the device. */
export function ReportDownload({ meeting }: { meeting: MeetingSummary }) {
  const t = useText().services['meeting-recorder'];
  const { getToken } = useAuth();
  const path = `${meetingPath(meeting.unitId, meeting.id)}/report/file`;
  const download = useMutation({
    mutationFn: () => downloadFile(() => getToken(), path, `meeting-report-${meeting.date}.pdf`),
  });
  return (
    <>
      <ActionButton
        label={t.status.download}
        disabled={download.isPending}
        onClick={() => {
          download.mutate();
        }}
      />
      <ErrorAlert error={download.error} refusals={t.refusals} />
    </>
  );
}
