/**
 * A calendar date (`YYYY-MM-DD`) moved by whole days, as a calendar date.
 * Worked in UTC on the date alone, so no clock change can shift it.
 */
export function addDaysToDate(date: string, days: number): string {
  const moved = new Date(`${date}T00:00:00Z`);
  moved.setUTCDate(moved.getUTCDate() + days);
  return moved.toISOString().slice(0, 10);
}
