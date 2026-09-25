import type { ArchiveCategory } from '../../../../shared/administration-panel/lists';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';

/** Brief 25 B3 and 13 A3: the archive categories, shown as fixed. */
export function ArchiveCategoriesSection({ categories }: { categories: ArchiveCategory[] }) {
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].lists;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.archiveCategories}</h2>
      <p className="max-w-prose">{t.archiveCategoriesFixed}</p>
      <ul className="list-disc ps-6">
        {categories.map((category) => (
          <li key={category.id}>{{ en: category.nameEn, ar: category.nameAr }[language]}</li>
        ))}
      </ul>
    </section>
  );
}
