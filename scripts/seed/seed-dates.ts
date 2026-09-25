/** A real calendar date written as YYYY-MM-DD (docs/seed-files.md). */
export function isSeedDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return new Date(`${value}T00:00:00Z`).toISOString().startsWith(value);
}

/** Today in Europe/London as YYYY-MM-DD — the date the portal judges terms by (T-040). */
export function todayInLondon(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
}

/** D-019 and D-029: a term is current from its start date until, not on, its end date. */
export function isCurrentTerm(term: { startDate: string; endDate: string | null }, today: string) {
  return term.startDate <= today && (term.endDate === null || term.endDate > today);
}
