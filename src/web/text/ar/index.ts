import type { TextShape } from '../text-shape';
import type { englishText } from '../en';
import { portalShellText } from './portal-shell';
import { eventOrganiserText } from './event-organiser';
import { meetingRecorderText } from './meeting-recorder';
import { treasuryText } from './treasury';
import { communicationHubText } from './communication-hub';
import { calendarText } from './calendar';
import { resourcesLibraryText } from './resources-library';
import { correspondenceAndLettersText } from './correspondence-and-letters';
import { committeeRegisterText } from './committee-register';
import { taskTrackerText } from './task-tracker';
import { achievementsAndReportsText } from './achievements-and-reports';
import { documentsArchiveText } from './documents-archive';
import { administrationPanelText } from './administration-panel';

export const arabicText: TextShape<typeof englishText> = {
  portalShell: portalShellText,
  services: {
    'event-organiser': eventOrganiserText,
    'meeting-recorder': meetingRecorderText,
    treasury: treasuryText,
    'communication-hub': communicationHubText,
    calendar: calendarText,
    'resources-library': resourcesLibraryText,
    'correspondence-and-letters': correspondenceAndLettersText,
    'committee-register': committeeRegisterText,
    'task-tracker': taskTrackerText,
    'achievements-and-reports': achievementsAndReportsText,
    'documents-archive': documentsArchiveText,
    'administration-panel': administrationPanelText,
  },
};
