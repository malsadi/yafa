import type { TaskStatus } from './task-statuses';

/** Brief 18 A and B1, B2: a task as the lists show it, flagged when due soon or overdue. */
export interface TaskRecord {
  id: string;
  unitId: string;
  unitNameEn: string;
  unitNameAr: string;
  /** Set for an event task (Phase 8), marked with its event. */
  eventId: string | null;
  title: string;
  description: string | null;
  ownerPersonId: string;
  ownerName: string | null;
  dueDate: string;
  status: TaskStatus;
  version: number;
  /** B1: still open and due within the due-soon window. */
  dueSoon: boolean;
  /** B1: still open and past its due date. */
  overdue: boolean;
}

/** Brief 18 B4: one step in a task's history — who did what, and when. */
export interface TaskHistoryEntry {
  action: 'created' | 'changed';
  actorName: string | null;
  occurredAt: string;
  /** What changed, field by field, as it was and as it became. */
  changes: { field: string; before: string | null; after: string | null }[];
}

/** A current officer of the unit, whom a task may be given to (D-141). */
export interface TaskOwnerChoice {
  personId: string;
  name: string;
}
