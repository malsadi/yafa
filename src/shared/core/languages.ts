/**
 * Brief section 8.5 (D-013): the portal works in English and Arabic from
 * launch. Fixed by the brief, not configured — each has its own folder of
 * texts under `src/web/text/`. Arabic is right-to-left.
 */
export const LANGUAGES = ['en', 'ar'] as const;

export type Language = (typeof LANGUAGES)[number];

export const RIGHT_TO_LEFT_LANGUAGES: readonly Language[] = ['ar'];
