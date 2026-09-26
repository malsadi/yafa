const LONDON_CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

/** Minutes London is ahead of UTC at a moment. */
function londonOffsetMinutes(utcMs: number): number {
  const parts = Object.fromEntries(
    LONDON_CLOCK.formatToParts(new Date(utcMs)).map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
  );
  return Math.round((asUtc - utcMs) / 60_000);
}

/**
 * A time on a London day (brief 9.1: the portal's time zone), as the UTC
 * moment it is — so a phone shows it right whatever the season.
 */
export function londonTimeToUtc(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const naive = Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0);
  return new Date(
    naive - londonOffsetMinutes(naive - londonOffsetMinutes(naive) * 60_000) * 60_000,
  );
}
