import { useAuth } from '@clerk/react';
import { useMutation } from '@tanstack/react-query';
import { downloadFile } from '../../app/files/download-file';
import { useText } from '../../app/language/use-text';
import { ActionButton } from '../../components/action-button';
import { ErrorAlert } from '../../components/error-alert';
import { reportPath } from './achievements.api';

/** Brief 24 B2: the finalised report's PDF, saved to the device. */
export function ReportDownload(props: { unitId: string; reportId: string; year: number }) {
  const t = useText().services['achievements-and-reports'];
  const { getToken } = useAuth();
  const download = useMutation({
    mutationFn: () =>
      downloadFile(
        () => getToken(),
        `${reportPath(props.unitId, props.reportId)}/file`,
        `annual-report-${String(props.year)}.pdf`,
      ),
  });
  return (
    <>
      <ActionButton
        label={t.reports.download}
        disabled={download.isPending}
        onClick={() => {
          download.mutate();
        }}
      />
      <ErrorAlert error={download.error} refusals={t.refusals} />
    </>
  );
}
