import type { Language } from '../../../shared/core/languages';

/**
 * D-211: a meeting's Calendar entry, clash or automatic post, titled in the
 * reader's language — its type's Arabic name where it has one. An event's
 * name is typed once, so it has one title for everyone.
 */
export function titleInLanguage(
  record: { title: string; titleAr: string | null },
  language: Language,
) {
  return language === 'ar' ? (record.titleAr ?? record.title) : record.title;
}
