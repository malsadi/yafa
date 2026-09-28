import type { YearEndSummary } from '../treasury/treasury-records';
import type { AnnualReportStatus } from './annual-report-statuses';

/**
 * Brief 24 B2 and D-215 (O-155 to O-160): what the annual report brings
 * together. A section is null where its service is switched off for the
 * unit, and says so (O-160).
 */
export interface AnnualReportContent {
  unitNameEn: string;
  unitNameAr: string;
  year: number;
  periodStart: string;
  periodEnd: string;
  summary: string | null;
  achievements: {
    title: string;
    date: string;
    categoryNameEn: string | null;
    categoryNameAr: string | null;
    officers: string[];
  }[];
  /** P17: events that reached Completed or Closed in the period; cancelled ones never. */
  events: { name: string; completedOn: string }[] | null;
  meetings: { typeNameEn: string; typeNameAr: string; date: string }[] | null;
  /** P18: provisional while the financial year is open. */
  treasury: YearEndSummary | null;
  /** The officers current on the day it is finalised (today's in a draft). */
  officers: { name: string; roleNameEn: string; roleNameAr: string }[];
}

/** A unit's annual report for one year: live while a draft, frozen once finalised (O-157, O-158). */
export interface AnnualReportRecord {
  id: string;
  unitId: string;
  year: number;
  status: AnnualReportStatus;
  summary: string | null;
  version: number;
  finalisedAt: string | null;
  finalisedByName: string | null;
  content: AnnualReportContent;
}

/** A unit's annual reports, and the latest year whose period has ended (O-157). */
export interface AnnualReportsView {
  reports: { id: string; year: number; status: AnnualReportStatus }[];
  latestEndedYear: number | null;
}
