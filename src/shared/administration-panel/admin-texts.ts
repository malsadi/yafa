/**
 * Brief 8.5, 25 C4 and C5: the texts the data administrator writes, each in
 * English and Arabic, stored in the database. The privacy notice is kept
 * apart, in its own versions (brief 13). Which texts exist is fixed by the
 * brief; their words are the administrator's.
 */
export const ADMIN_TEXT_KEYS = ['iphone-install-guide', 'access-not-active', 'help'] as const;

export type AdminTextKey = (typeof ADMIN_TEXT_KEYS)[number];

/** A text as stored: English, and Arabic once written (D-022: English shows until then). */
export interface AdminText {
  key: AdminTextKey;
  textEn: string;
  textAr: string | null;
}
