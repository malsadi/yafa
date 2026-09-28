import { useAuth } from '@clerk/react';
import { useMutation } from '@tanstack/react-query';
import { downloadFile } from '../../app/files/download-file';
import { useText } from '../../app/language/use-text';
import { ActionButton } from '../../components/action-button';
import { ErrorAlert } from '../../components/error-alert';

/** Brief 23 B2, B3: the letter as filed — its PDF, or its scan or photo — saved to the device. */
export function LetterDownload(props: { path: string; fileName: string }) {
  const t = useText().services['correspondence-and-letters'];
  const { getToken } = useAuth();
  const download = useMutation({
    mutationFn: () => downloadFile(() => getToken(), `${props.path}/file`, props.fileName),
  });
  return (
    <div className="flex flex-col gap-1">
      <ActionButton
        label={t.letter.download}
        disabled={download.isPending}
        onClick={() => {
          download.mutate();
        }}
      />
      <ErrorAlert error={download.error} refusals={t.refusals} />
    </div>
  );
}
