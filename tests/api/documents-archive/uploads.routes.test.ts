import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { insertGrant } from '../../core/permissions/permission-fixtures';
import { acknowledgeNotice, insertNoticeVersion, seedOfficer } from '../../app/app-fixtures';
import { call, setDocumentFileRules } from './archive-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69AUPNV';
type Officer = Awaited<ReturnType<typeof seedOfficer>>;
let uploader: Officer;
let other: Officer;

const DETAILS = {
  categoryId: 'governance',
  title: 'Constitution',
  description: '  ',
  documentDate: '2025-06-01',
};

/** Start, put the file where the browser would, then complete (9.3). */
async function upload(officer: Officer, unitId: string, details: Record<string, unknown>) {
  const unit = `/api/documents-archive/units/${unitId}`;
  const startRes = await call(officer.clerkUserId, 'POST', `${unit}/uploads`, {
    fileName: 'constitution.pdf',
    size: 3,
    contentType: 'application/pdf',
  });
  if (!startRes.ok) return startRes;
  const start = await startRes.json<{ documentId: string; fileId: string }>();
  await env.FILES.put(
    `app-branch-${officer.clerkUserId.slice(-3)}/documents-archive/${start.documentId}/${start.fileId}-constitution.pdf`,
    'pdf',
    { httpMetadata: { contentType: 'application/pdf' } },
  );
  return call(officer.clerkUserId, 'PUT', `${unit}/documents/${start.documentId}`, {
    fileId: start.fileId,
    fileName: 'constitution.pdf',
    ...details,
  });
}

describe('uploading to the archive (brief 15 A2; D-096, D-097)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    uploader = await seedOfficer({ suffix: 'AU1' });
    other = await seedOfficer({ suffix: 'AU2' });
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
  });

  it('files an upload, locked, with its document date and an empty description left out', async () => {
    const res = await upload(uploader, uploader.unitId, DETAILS);
    expect(res.status).toBe(201);
    const { documentId } = await res.json<{ documentId: string }>();
    const doc = await (
      await call(uploader.clerkUserId, 'GET', `/api/documents-archive/documents/${documentId}`)
    ).json();
    expect(doc).toMatchObject({
      source: 'upload',
      categoryId: 'governance',
      title: 'Constitution',
      description: null,
      documentDate: '2025-06-01',
      versions: [{ version: 1, fileName: 'constitution.pdf' }],
    });
    const file = await env.DB.prepare(
      'SELECT f.locked FROM files f JOIN archive_document_versions v ON v.file_id = f.id WHERE v.document_id = ?',
    )
      .bind(documentId)
      .first<{ locked: number }>();
    expect(file?.locked).toBe(1);
  });

  it('takes uploads into Governance and General only (D-096)', async () => {
    expect(
      (await upload(uploader, uploader.unitId, { ...DETAILS, categoryId: 'general' })).status,
    ).toBe(201);
    expect(
      (await upload(uploader, uploader.unitId, { ...DETAILS, categoryId: 'meetings' })).status,
    ).toBe(400);
  });

  it("refuses an upload to another unit's archive", async () => {
    expect((await upload(uploader, other.unitId, DETAILS)).status).toBe(403);
  });

  it('refuses an upload to an inactive branch (P4)', async () => {
    await env.DB.prepare("UPDATE units SET status = 'inactive' WHERE id = ?")
      .bind(other.unitId)
      .run();
    expect((await upload(other, other.unitId, DETAILS)).status).toBe(409);
  });
});
