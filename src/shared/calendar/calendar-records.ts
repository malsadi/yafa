/** Brief 19 A: the three kinds of date the calendar shows. */
export const CALENDAR_KINDS = ['meeting', 'event', 'community'] as const;
export type CalendarKind = (typeof CALENDAR_KINDS)[number];

/** Brief 19 A and B: one date on the calendar, in its unit's colour (B2). */
export interface CalendarItem {
  kind: CalendarKind;
  /** The meeting's or event's own record (A1, A2 — changed only there), or the community date's id. */
  id: string;
  unitId: string;
  unitNameEn: string;
  unitNameAr: string;
  colour: string | null;
  title: string;
  /** D-211: a meeting's title in Arabic; null where there is one title for everyone. */
  titleAr: string | null;
  startDate: string;
  endDate: string;
  startTime: string | null;
  description: string | null;
  /** A3 and D-146: a General Council date shown in every branch's calendar. */
  forAllBranches: boolean;
  /** D-147: a retired community date — shown only to those who can bring it back. */
  retiredAt: string | null;
  /** 9.1: a community date's version, sent back with a change. */
  version: number | null;
}

/** A unit the calendar can show, with its colour (B2, B3). */
export interface CalendarUnit {
  id: string;
  nameEn: string;
  nameAr: string;
  colour: string | null;
}

export interface CalendarView {
  items: CalendarItem[];
  units: CalendarUnit[];
}

/** Brief 19 B4, D-149 and D-151: another meeting or event of the unit on a chosen day — a notice, never a block. */
export interface ClashNotice {
  kind: 'meeting' | 'event';
  title: string;
  /** D-211: the title in Arabic, where it has one. */
  titleAr: string | null;
  date: string;
  startTime: string | null;
}
