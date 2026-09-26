import { addDaysToDate } from '../../../../shared/core/add-days-to-date';
import { londonTimeToUtc } from '../../../../shared/core/london-time-to-utc';

/** One date as the phone calendar gets it. */
export interface FeedEvent {
  uid: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  startTime: string | null;
}

/** RFC 5545 text: backslash, semicolon, comma and line breaks escaped. */
const text = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const compactDate = (date: string) => date.replace(/-/g, '');
const utcStamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

/** RFC 5545: lines longer than 75 octets are folded, continuing with a space. */
function fold(line: string): string {
  const bytes = new TextEncoder();
  const out: string[] = [];
  let current = '';
  for (const char of line) {
    if (bytes.encode(current + char).length > (out.length ? 74 : 75)) {
      out.push(current);
      current = '';
    }
    current += char;
  }
  out.push(current);
  return out.join('\r\n ');
}

/**
 * A timed date on one day starts at its London time (as UTC); anything
 * else is whole days, first to last (the end is the day after, as RFC 5545
 * counts all-day spans).
 */
function when(event: FeedEvent): string[] {
  if (event.startTime && event.startDate === event.endDate) {
    return [`DTSTART:${utcStamp(londonTimeToUtc(event.startDate, event.startTime))}`];
  }
  return [
    `DTSTART;VALUE=DATE:${compactDate(event.startDate)}`,
    `DTEND;VALUE=DATE:${compactDate(addDaysToDate(event.endDate, 1))}`,
  ];
}

/** Brief 19 C1: the feed as an iCalendar file. */
export function buildIcs(params: {
  name: string | null;
  events: FeedEvent[];
  stamp: Date;
}): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Yafa portal//Calendar//EN',
    'CALSCALE:GREGORIAN',
  ];
  if (params.name) lines.push(`X-WR-CALNAME:${text(params.name)}`);
  for (const event of params.events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `DTSTAMP:${utcStamp(params.stamp)}`,
      ...when(event),
      `SUMMARY:${text(event.title)}`,
    );
    if (event.description) lines.push(`DESCRIPTION:${text(event.description)}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return `${lines.map(fold).join('\r\n')}\r\n`;
}
