import { Link } from 'react-router';
import type {
  ArchiveCategory,
  ArchiveDocumentSummary,
} from '../../../shared/documents-archive/archive-document';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { useFormatDate } from '../../app/language/use-format-date';

/** Brief 15 B1: the documents found, each opening its own page. */
export function ArchiveResults(props: {
  documents: ArchiveDocumentSummary[];
  categories: ArchiveCategory[];
}) {
  const t = useText().services['documents-archive'];
  const { language } = useLanguage();
  const formatDate = useFormatDate();
  if (props.documents.length === 0) return <p>{t.search.noResults}</p>;
  const categoryName = (id: string) => {
    const category = props.categories.find((c) => c.id === id);
    return category ? (language === 'ar' ? category.nameAr : category.nameEn) : id;
  };
  return (
    <ul className="flex flex-col gap-2">
      {props.documents.map((document) => (
        <li key={document.id} className="rounded border border-slate-300 p-3">
          <Link to={`/documents-archive/${document.id}`} className="font-medium underline">
            {document.title}
          </Link>
          <p className="text-sm text-slate-600">
            {categoryName(document.categoryId)} ·{' '}
            {language === 'ar' ? document.unitNameAr : document.unitNameEn} ·{' '}
            {fillText(t.document.documentDate, { date: formatDate(document.documentDate) })}
          </p>
        </li>
      ))}
    </ul>
  );
}
