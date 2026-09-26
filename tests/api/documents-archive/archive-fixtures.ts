import { env } from 'cloudflare:workers';
import { setSetting } from '../../../src/worker/core/settings';
import { fileRecord } from '../../../src/worker/services/documents-archive';
import { buildTestApp, ORIGIN } from '../../app/app-fixtures';

// Fictional R2 credentials: signing a link needs no network.
export const R2 = {
  R2_ACCOUNT_ID: 'fictional',
  R2_ACCESS_KEY_ID: 'id',
  R2_SECRET_ACCESS_KEY: 'secret',
};

export async function call(clerkUserId: string, method: string, path: string, body?: unknown) {
  const { app, tokenFor } = await buildTestApp(R2);
  return app.request(`${ORIGIN}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await tokenFor(clerkUserId)}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** The administrator's file rules for documents, and for downloads (9.3). */
export async function setDocumentFileRules(actorPersonId: string): Promise<void> {
  for (const [key, value] of [
    ['administration-panel.file_types_documents', ['application/pdf']],
    ['administration-panel.file_size_limit_documents_mb', 5],
    ['administration-panel.download_link_threshold_mb', 1],
    ['administration-panel.download_link_lifetime_minutes', 5],
  ] as const) {
    await setSetting(env.DB, { key, value, actorPersonId });
  }
}

type LockedFile = Parameters<typeof fileRecord>[1]['file'];

function insertLockedFile(file: LockedFile): D1PreparedStatement {
  return env.DB.prepare(
    `INSERT INTO files (id, key, unit_id, service, record_id, use, file_name, uploaded_by, size, content_type, checksum, locked, created_at)
     VALUES (?, ?, ?, ?, ?, 'documents', ?, ?, ?, ?, ?, 1, ?)`,
  ).bind(
    file.id,
    file.key,
    file.unitId,
    file.service,
    file.recordId,
    file.fileName,
    file.uploadedBy,
    file.size,
    file.contentType,
    file.checksum,
    file.createdAt,
  );
}

/** A finished record of a unit filed automatically, as a service would (15 A1). */
export async function fileAutomatically(params: {
  unitId: string;
  unitCode: string;
  recordId: string;
  title: string;
  categoryId: string;
  documentDate: string;
  filedBy: string;
}): Promise<void> {
  const file = {
    id: `file-${params.recordId}`,
    key: `${params.unitCode}/meeting-recorder/${params.recordId}/file-${params.recordId}-report.pdf`,
    unitId: params.unitId,
    service: 'meeting-recorder',
    recordId: params.recordId,
    use: 'documents' as const,
    fileName: 'report.pdf',
    uploadedBy: params.filedBy,
    size: 6,
    contentType: 'application/pdf',
    checksum: 'c',
    locked: true,
    createdAt: new Date().toISOString(),
  };
  await env.FILES.put(file.key, 'report', { httpMetadata: { contentType: file.contentType } });
  await env.DB.batch([
    insertLockedFile(file),
    ...fileRecord(env.DB, {
      file,
      categoryId: params.categoryId,
      sourceService: 'meeting-recorder',
      sourceRecordId: params.recordId,
      title: params.title,
      documentDate: params.documentDate,
      filedBy: params.filedBy,
    }),
  ]);
}
