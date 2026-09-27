import type { FileUse } from '../core/file-uses';
import { EventFileSection } from './event-statuses';

/**
 * Brief 21 F1, F2 and 9.3: the file uses each section takes — its allowed
 * types and size limits are the administrator's settings for that use.
 * Documents: bookings, letters, programmes, reports. Media: photos,
 * videos and flyers.
 */
export const EVENT_FILE_USES: Record<EventFileSection, readonly FileUse[]> = {
  [EventFileSection.Documents]: ['documents'],
  [EventFileSection.Media]: ['media-images', 'video'],
};

/** Brief 21 F1, F2: an event file as the event screen lists it. */
export interface EventFileRecord {
  fileId: string;
  section: EventFileSection;
  fileName: string;
  contentType: string;
  size: number;
  addedByName: string | null;
  addedAt: string;
  /** D-196: when it was retired — hidden from the event, kept, and recoverable before close. */
  retiredAt: string | null;
}
