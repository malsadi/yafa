const LONDON_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' });

/**
 * Today's calendar date in Europe/London, as `YYYY-MM-DD` — matching the
 * granularity of `terms.start_date`/`end_date`, which are dates an officer
 * enters, not timestamps. Used to resolve D-019's term-currency rule
 * (T-040: Europe/London chosen over UTC, since brief section 9.1 already
 * fixes it as the portal's display timezone and every officer is UK-based).
 * `referenceDate` defaults to now; tests pass a fixed value for determinism.
 */
export function getTodayInLondon(referenceDate: Date = new Date()): string {
  return LONDON_DATE_FORMATTER.format(referenceDate);
}
