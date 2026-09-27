import type { Language } from '../../shared/core/languages';

/**
 * Brief 22 C1, 9.4 and D-208: the meeting report as printed — every value
 * already written in the logging officer's language, with the labels.
 */
export interface MeetingReportDocument {
  language: Language;
  organisationName: string;
  unitName: string;
  title: string;
  details: string[];
  attendance: { heading: string; rows: { name: string; mark: string }[] };
  originalAgenda: { heading: string; items: string[] };
  updatedAgenda: { heading: string; items: string[] };
  minutes: {
    heading: string;
    items: {
      title: string;
      /** D-211: each comment, with who recorded it for the officer, in words. */
      comments: { name: string; comment: string; recordedFor: string }[];
      outcome: string;
    }[];
  };
}
