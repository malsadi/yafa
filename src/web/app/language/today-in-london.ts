const LONDON_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' });

/** Today's date in Europe/London, the portal's time zone (9.1), as `YYYY-MM-DD`. */
export function todayInLondon(): string {
  return LONDON_DATE.format(new Date());
}
