import type { ArchiveDocumentVersion } from '../../../shared/documents-archive/archive-document';
import { ApiError } from '../../app/api/api-error';
import { useFormatDate } from '../../app/language/use-format-date';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { RefusalAlert } from '../../components/refusal-alert';
import { fillText } from '../../text/fill-text';
import { useArchiveDownload } from './use-archive-download';

/** Brief 15 A4 and B2: every version of a document, each to download. */
export function DocumentVersions(props: {
  documentId: string;
  versions: ArchiveDocumentVersion[];
}) {
  const t = useText().services['documents-archive'];
  const formatTimestamp = useFormatTimestamp();
  const formatDate = useFormatDate();
  const download = useArchiveDownload(props.documentId);
  const error = download.error;
  const refusal = error instanceof ApiError ? error.code : (error?.message ?? null);
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{t.document.versions}</h2>
      <RefusalAlert code={refusal} refusals={t.refusals} />
      <ul className="flex flex-col gap-2">
        {props.versions.map((v) => (
          <li key={v.version} className="flex flex-wrap items-center gap-3">
            <span>
              {fillText(t.document.version, {
                version: String(v.version),
                fileName: v.fileName,
                documentDate: formatDate(v.documentDate),
                date: formatTimestamp(v.createdAt),
              })}
            </span>
            <button
              type="button"
              className="rounded border border-slate-400 px-3 py-1"
              disabled={download.isPending}
              onClick={() => {
                download.mutate({ version: v.version, fileName: v.fileName });
              }}
            >
              {t.document.download}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
