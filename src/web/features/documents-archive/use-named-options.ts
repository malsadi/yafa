import { useLanguage } from '../../app/language/use-language';

/** Items named in both languages, as choices named in the officer's. */
export function useNamedOptions() {
  const { language } = useLanguage();
  return (items: readonly { id: string; nameEn: string; nameAr: string }[]) =>
    items.map((item) => ({ value: item.id, label: language === 'ar' ? item.nameAr : item.nameEn }));
}
