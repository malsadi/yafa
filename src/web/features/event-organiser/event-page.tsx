import { useParams } from 'react-router';
import { useText } from '../../app/language/use-text';
import { StatusMessage } from '../../components/status-message';
import { CloseEventPanel } from './close-event-panel';
import { EventAccountPanel } from './event-account-panel';
import { EventDetailsPanel } from './event-details-panel';
import { EventFilesPanel } from './event-files-panel';
import { EventReportPanel } from './event-report-panel';
import { EventStatusPanel } from './event-status-panel';
import { EventTasksPanel } from './event-tasks-panel';
import { PublishPanel } from './publish-panel';
import { useEvent } from './use-event-queries';
import { useEventUnit } from './use-event-unit';

const REPORTABLE = ['Completed', 'Cancelled', 'Closed'];

/** Brief 21: one event — its details, status, publishing, tasks, account, files, report and close. */
export function EventPage() {
  const unitId = useEventUnit();
  const { eventId = '' } = useParams();
  const text = useText();
  const t = text.services['event-organiser'];
  const event = useEvent(unitId, eventId);
  if (event.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (event.isError)
    return <StatusMessage>{t.refusals['event-organiser.event-not-found']}</StatusMessage>;
  const e = event.data;
  return (
    <div className="flex flex-col gap-6">
      <EventDetailsPanel event={e} />
      <EventStatusPanel event={e} />
      <PublishPanel event={e} />
      <EventTasksPanel event={e} />
      <EventAccountPanel event={e} />
      <EventFilesPanel event={e} />
      <section className="flex flex-col gap-1" aria-disabled="true">
        <h3 className="font-semibold text-slate-500">{t.volunteers.heading}</h3>
        <p className="text-sm text-slate-500">{t.volunteers.comingSoon}</p>
      </section>
      {REPORTABLE.includes(e.status) && <EventReportPanel event={e} />}
      {(e.status === 'Completed' || e.status === 'Cancelled') && <CloseEventPanel event={e} />}
    </div>
  );
}
