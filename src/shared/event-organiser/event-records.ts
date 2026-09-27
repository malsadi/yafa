import type { EventStatus } from './event-statuses';

/** Brief 21 A3 and D-178: a template, with its default tasks and budget lines. */
export interface EventTemplateRecord {
  id: string;
  /** The General Council's templates are the national ones (P15). */
  unitId: string;
  name: string;
  retiredAt: string | null;
  version: number;
  tasks: { title: string; description: string | null; daysBefore: number }[];
  budgetLines: { name: string; amountPence: number }[];
}

/** Brief 21 A1 and D-172: an event as the list and screen show it. */
export interface EventSummary {
  id: string;
  unitId: string;
  name: string;
  typeItemId: string;
  typeNameEn: string;
  typeNameAr: string;
  leadPersonId: string;
  leadName: string | null;
  firstDay: string;
  startTime: string | null;
  lastDay: string | null;
  status: EventStatus;
  createdBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
  calendarPublishedAt: string | null;
  noticeboardPublishedAt: string | null;
  /** D-190: when the automatic "cancelled" post was made. */
  cancellationPostedAt: string | null;
  closedAt: string | null;
  version: number;
}
