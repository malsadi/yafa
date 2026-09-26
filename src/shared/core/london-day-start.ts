const LONDON_CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  hourCycle: 'h23',
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * The moment a London calendar day (`YYYY-MM-DD`) begins, as a UTC ISO
 * timestamp, so a day entered by an officer can be compared with stored
 * timestamps. London's clocks change at 01:00 UTC, never at midnight, so
 * the offset at UTC midnight is the day's own.
 */
export function londonDayStart(date: string): string {
  const utcMidnight = new Date(`${date}T00:00:00Z`);
  const [hours, minutes] = LONDON_CLOCK.format(utcMidnight).split(':').map(Number);
  const offsetMs = ((hours ?? 0) * 60 + (minutes ?? 0)) * 60_000;
  return new Date(utcMidnight.getTime() - offsetMs).toISOString();
}
