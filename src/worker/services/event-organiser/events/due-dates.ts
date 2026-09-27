/** D-178: the day `days` before `date` (YYYY-MM-DD), counted in whole calendar days. */
export function daysBefore(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  const at = new Date(Date.UTC(year, month - 1, day - days));
  return at.toISOString().slice(0, 10);
}
