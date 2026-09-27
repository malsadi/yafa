import { useAuth } from '@clerk/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { EVENT_FILE_SECTIONS } from '../../../shared/event-organiser/event-statuses';
import { downloadFile } from '../../app/files/download-file';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { EventFileAdder } from './event-file-adder';
import { EventFileList } from './event-file-list';
import { eventPath } from './event-organiser.api';
import { useEventHints } from './event-hints';
import { EVENTS_KEY } from './event-keys';
import { useEventAction } from './use-event-action';
import { useEventFiles } from './use-event-queries';

/**
 * Brief 21 F1, F2 and D-185: the event's Documents and Media, at every
 * stage — added and removed by its lead officer or those who manage events
 * until it closes; seen by everyone who sees the event.
 */
export function EventFilesPanel({ event }: { event: EventSummary }) {
  const t = useText().services['event-organiser'];
  const { getToken } = useAuth();
  const hints = useEventHints(event);
  const files = useEventFiles(event.unitId, event.id);
  const remove = useEventAction();
  const queryClient = useQueryClient();
  const base = `${eventPath(event.unitId, event.id)}/files`;
  const download = useMutation({
    mutationFn: (f: { fileId: string; fileName: string }) =>
      downloadFile(() => getToken(), `${base}/${f.fileId}/file`, f.fileName),
  });
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{t.files.heading}</h3>
      <ErrorAlert error={remove.error ?? download.error} refusals={t.refusals} />
      {EVENT_FILE_SECTIONS.map((section) => (
        <div key={section} className="flex flex-col gap-1">
          <h4 className="text-sm font-semibold">{t.files.sections[section]}</h4>
          <EventFileList
            files={(files.data ?? []).filter((f) => f.section === section)}
            removeLabel={hints.leadsOrManages ? t.files.remove : null}
            busy={remove.isPending}
            onDownload={(f) => {
              download.mutate(f);
            }}
            onRemove={(f) => {
              remove.mutate({ path: `${base}/${f.fileId}/remove`, method: 'POST' });
            }}
          />
        </div>
      ))}
      {hints.leadsOrManages && (
        <EventFileAdder
          filesPath={base}
          onAdded={() => void queryClient.invalidateQueries({ queryKey: EVENTS_KEY })}
        />
      )}
    </section>
  );
}
