const LONG_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2026-09-24" → "24 September 2026" (brief section 28's UK English date). */
export function formatLongDate(isoDate: string): string {
  return LONG_DATE.format(new Date(`${isoDate}T00:00:00Z`));
}

/** "2026-09-24 19:40" (UK time) → "24 September 2026 at 19:40, UK time". */
export function formatLongDateTime(stamp: string): string {
  const [date = '', time = ''] = stamp.split(' ');
  return `${formatLongDate(date)} at ${time}, UK time`;
}
