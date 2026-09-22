/**
 * Formats an ISO 8601 UTC timestamp for display in Europe/London (brief
 * section 9.1: "Timestamps are ISO 8601 UTC text, displayed in Europe/
 * London"), in the officer's locale (`'en-GB'` or `'ar'`, brief section
 * 8.5). `options` are `Intl.DateTimeFormat` options beyond timezone and
 * locale, which this function always fixes — how much of the date/time to
 * show is the caller's choice, since it differs by screen.
 */
export function formatDateLondon(
  isoDateTime: string,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'Europe/London' }).format(
    new Date(isoDateTime),
  );
}
