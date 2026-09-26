import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../app/api/api-error';
import { useApiRequest } from '../../app/api/use-api-request';
import { useFormatDate } from '../../app/language/use-format-date';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { PageHeading } from '../../components/page-heading';
import { RefusalAlert } from '../../components/refusal-alert';
import { StatusMessage } from '../../components/status-message';
import { fillText } from '../../text/fill-text';
import { fetchArchiveDocument } from './archive.api';
import { AddVersionForm } from './add-version-form';
import { DocumentVersions } from './document-versions';

/** Brief 15 A4 and B2: one document, its details and its versions. */
export function DocumentPage() {
  const documentId = useParams().documentId ?? '';
  const request = useApiRequest();
  const text = useText();
  const t = text.services['documents-archive'];
  const { language } = useLanguage();
  const formatDate = useFormatDate();
  const formatTimestamp = useFormatTimestamp();
  const { context } = useActiveSession();
  const document = useQuery({
    queryKey: ['documents-archive', 'document', documentId],
    queryFn: () => fetchArchiveDocument(request, documentId),
  });
  if (document.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (document.isError) {
    const code = document.error instanceof ApiError ? document.error.code : 'server.error';
    return <RefusalAlert code={code} refusals={t.refusals} />;
  }
  const d = document.data;
  const filed = { date: formatTimestamp(d.filedAt), name: d.filedByName ?? '' };
  return (
    <div className="flex flex-col gap-4">
      <Link to="/documents-archive" className="underline">
        {t.document.back}
      </Link>
      <PageHeading>{d.title}</PageHeading>
      <p className="text-sm">
        {d.source === 'automatic' ? t.document.automatic : t.document.uploaded}
      </p>
      <p>{language === 'ar' ? d.unitNameAr : d.unitNameEn}</p>
      {d.description && <p className="whitespace-pre-line">{d.description}</p>}
      <p>{fillText(t.document.documentDate, { date: formatDate(d.documentDate) })}</p>
      <p>{fillText(d.filedByName ? t.document.filedOn : t.document.filedOnNoName, filed)}</p>
      <DocumentVersions documentId={d.id} versions={d.versions} />
      {/* A hint only (T-042): the portal decides each upload itself. */}
      {d.source === 'upload' &&
        context.units.includes(d.unitId) &&
        context.capabilities.includes('documents-archive.documents.upload') && (
          <AddVersionForm unitId={d.unitId} documentId={d.id} />
        )}
    </div>
  );
}
