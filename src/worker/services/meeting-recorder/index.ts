import { MEETING_RECORDER_CAPABILITIES } from '../../../shared/meeting-recorder/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 2's capabilities (brief section 22), into the catalogue (7.2). */
export function registerMeetingRecorderCapabilities(): void {
  MEETING_RECORDER_CAPABILITIES.forEach(registerCapability);
}

export { registerMeetingRecorderSettings } from './settings';
export { registerMeetingsRoutes } from './meetings/meetings.routes';
export { registerStatusRoutes as registerMeetingStatusRoutes } from './status/status.routes';
export { registerAttendeesRoutes } from './attendees/attendees.routes';
export { registerAgendaRoutes } from './agenda/agenda.routes';
export { registerMinutesRoutes } from './minutes/minutes.routes';
export { registerReportRoutes as registerMeetingReportRoutes } from './report/report.routes';
export { registerSendLaterRoutes } from './targets/send-later.routes';
export { logMeetingReport } from './report/log-report.service';
