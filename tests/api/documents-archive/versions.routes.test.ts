import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type {
  ArchiveDocumentDetail,
  ArchiveDocumentSummary,
} from '../../../src/shared/documents-archive/archive-document';
import { insertGrant } from '../../core/permissions/permission-fixtures';
import { acknowledgeNotice, insertNoticeVersion, seedOfficer } from '../../app/app-fixtures';
import { call, fileAutomatically, setDocumentFileRules } from './archive-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69AVRNV';
type Officer = Awaited<ReturnType<typeof seedOfficer>>;
let uploader: Officer;
let other: Officer;

const unitCode = (officer: Officer) => `app-branch-${officer.clerkUserId.slice(-3)}`;

/** Start, put the file where the browser would, then complete (9.3). */
async function send(officer: Officer, paths: { start: string; complete: string }, details: object) {
  const startRes = await call(officer.clerkUserId, 'POST', paths.start, {
    fileName: 'constitution.pdf',
    size: 3,
    contentType: 'application/pdf',
  });
  if (!startRes.ok) return startRes;
  const start = await startRes.json<{ documentId?: string; fileId: string }>();
  const recordId = start.documentId ?? paths.complete.split('/documents/')[1]?.split('/')[0] ?? '';
  await env.FILES.put(
    `${unitCode(officer)}/documents-archive/${recordId}/${start.fileId}-constitution.pdf`,
    'pdf',
    { httpMetadata: { contentType: 'application/pdf' } },
  );
  const complete = paths.complete.replace(':documentId', start.documentId ?? '');
  return call(officer.clerkUserId, 'PUT', complete, {
    fileId: start.fileId,
    fileName: 'constitution.pdf',
    ...details,
  });
}

const document = async (officer: Officer, id: string) =>
  (
    await call(officer.clerkUserId, 'GET', `/api/documents-archive/documents/${id}`)
  ).json<ArchiveDocumentDetail>();

function addVersion(officer: Officer, unitId: string, documentId: string, documentDate: string) {
  const base = `/api/documents-archive/units/${unitId}/documents/${documentId}/versions`;
  return send(officer, { start: `${base}/uploads`, complete: base }, { documentDate });
}

describe('new versions of an uploaded document (brief 15 A4; D-110)', () => {
  let documentId = '';

  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    uploader = await seedOfficer({ suffix: 'AV1' });
    other = await seedOfficer({ suffix: 'AV2' });
    for (const officer of [uploader, other]) {
      await acknowledgeNotice(officer.personId, NOTICE);
      for (const capability of [
        'documents-archive.documents.read',
        'documents-archive.documents.upload',
      ]) {
        await insertGrant(env.DB, {
          id: `${capability}-${officer.personId}`,
          roleId: `01ARZ3NDEKTSV4RRFFQ69AR${officer.clerkUserId.slice(-3)}`,
          capability,
          scope: 'own unit',
        });
      }
    }
    await setDocumentFileRules(uploader.personId);
    const unit = `/api/documents-archive/units/${uploader.unitId}`;
    const res = await send(
      uploader,
      { start: `${unit}/uploads`, complete: `${unit}/documents/:documentId` },
      { categoryId: 'governance', title: 'Constitution', documentDate: '2020-01-01' },
    );
    documentId = (await res.json<{ documentId: string }>()).documentId;
  });

  it('adds the next version with its own document date, keeping the first', async () => {
    expect((await addVersion(uploader, uploader.unitId, documentId, '2025-05-05')).status).toBe(
      204,
    );
    const doc = await document(uploader, documentId);
    expect(doc.documentDate).toBe('2025-05-05');
    expect(doc.versions.map((v) => [v.version, v.documentDate])).toEqual([
      [2, '2025-05-05'],
      [1, '2020-01-01'],
    ]);
  });

  it("finds the document by either version's date", async () => {
    const search = async (from: string, to: string) =>
      (
        await (
          await call(
            uploader.clerkUserId,
            'GET',
            `/api/documents-archive/documents?dateField=document&from=${from}&to=${to}`,
          )
        ).json<ArchiveDocumentSummary[]>()
      ).map((d) => d.id);
    expect(await search('2019-12-01', '2020-02-01')).toEqual([documentId]);
    expect(await search('2025-05-01', '2025-05-31')).toEqual([documentId]);
    expect(await search('2022-01-01', '2022-12-31')).toEqual([]);
  });

  it("refuses a version for another unit's document, and for an automatic filing", async () => {
    expect((await addVersion(other, other.unitId, documentId, '2025-06-01')).status).toBe(404);
    await fileAutomatically({
      unitId: uploader.unitId,
      unitCode: unitCode(uploader),
      recordId: 'rec-auto',
      title: 'Meeting report',
      categoryId: 'meetings',
      documentDate: '2026-02-02',
      filedBy: uploader.personId,
    });
    const auto = await env.DB.prepare(
      "SELECT id FROM archive_documents WHERE source_record_id = 'rec-auto'",
    ).first<{ id: string }>();
    const res = await addVersion(uploader, uploader.unitId, auto?.id ?? '', '2026-03-03');
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({
      error: { code: 'documents-archive.automatic-filing-locked' },
    });
  });

  it('keeps the first version dateless in the table, and every later one dated', async () => {
    const first = await env.DB.prepare(
      'SELECT file_id AS fileId FROM archive_document_versions WHERE document_id = ? AND version = 1',
    )
      .bind(documentId)
      .first<{ fileId: string }>();
    const insert = (version: number, date: string | null) =>
      env.DB.prepare(
        `INSERT INTO archive_document_versions (id, document_id, version, file_id, document_date, added_by, created_at)
         VALUES (?, ?, ?, ?, ?, 'p', 'now')`,
      )
        .bind(`check-${String(version)}`, documentId, version, first?.fileId ?? '', date)
        .run();
    await expect(insert(3, null)).rejects.toThrow(/CHECK/);
  });
});
