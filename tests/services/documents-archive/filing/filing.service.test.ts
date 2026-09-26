import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { fileRecord } from '../../../../src/worker/services/documents-archive';
import { fileFor, insertFileStatement, insertUnitForFiling } from '../../filed-file';

const UNIT = 'u-archive-filing';
const file = (id: string, locked = true) => fileFor(UNIT, id, locked);
const input = (id: string, recordId: string) => ({
  file: file(id),
  categoryId: 'meetings',
  sourceService: 'meeting-recorder',
  sourceRecordId: recordId,
  title: 'Committee meeting report',
  documentDate: '2026-09-01',
  filedBy: 'person',
});
const exec = (sql: string) => env.DB.prepare(sql).run();

async function fileOne(id: string, recordId: string): Promise<string> {
  await env.DB.batch([
    insertFileStatement(env.DB, file(id)),
    ...fileRecord(env.DB, input(id, recordId)),
  ]);
  const row = await env.DB.prepare('SELECT id FROM archive_documents WHERE source_record_id = ?')
    .bind(recordId)
    .first<{ id: string }>();
  return row?.id ?? '';
}

describe('fileRecord() (brief 15 A1, A4; D-097)', () => {
  beforeAll(async () => {
    await insertUnitForFiling(env.DB, UNIT);
  });

  it('files a finished record in its category, in the caller’s batch, with one version', async () => {
    const id = await fileOne('f-archive-1', 'report-1');
    const doc = await env.DB.prepare('SELECT * FROM archive_documents WHERE id = ?')
      .bind(id)
      .first();
    const versions = await env.DB.prepare(
      'SELECT version, file_id FROM archive_document_versions WHERE document_id = ?',
    )
      .bind(id)
      .all();

    expect(doc).toMatchObject({
      unit_id: UNIT,
      category_id: 'meetings',
      source: 'automatic',
      document_date: '2026-09-01',
      description: null,
    });
    expect(doc?.filed_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(versions.results).toEqual([{ version: 1, file_id: 'f-archive-1' }]);
  });

  it('refuses a file that is not locked, in the service and in the database', async () => {
    expect(() =>
      fileRecord(env.DB, { ...input('f-archive-2', 'report-2'), file: file('f-archive-2', false) }),
    ).toThrow('documents-archive.file-not-locked');
    const filing = fileRecord(env.DB, input('f-archive-2', 'report-2'));
    await expect(
      env.DB.batch([insertFileStatement(env.DB, file('f-archive-2', false)), ...filing]),
    ).rejects.toThrow(/must be locked/);
  });

  it('files a record only once', async () => {
    await fileOne('f-archive-3', 'report-3');
    await expect(fileOne('f-archive-4', 'report-3')).rejects.toThrow(/UNIQUE/);
  });

  it('never changes, deletes or versions an automatic filing (brief 15 rules)', async () => {
    const id = await fileOne('f-archive-5', 'report-5');
    await expect(
      exec(`UPDATE archive_documents SET title = 'x' WHERE id = '${id}'`),
    ).rejects.toThrow(/never changed/);
    await expect(exec(`DELETE FROM archive_documents WHERE id = '${id}'`)).rejects.toThrow(
      /ever deleted/,
    );
    await expect(
      exec(`UPDATE archive_document_versions SET version = 9 WHERE document_id = '${id}'`),
    ).rejects.toThrow(/never changed/);
    await expect(
      exec(`DELETE FROM archive_document_versions WHERE document_id = '${id}'`),
    ).rejects.toThrow(/ever deleted/);
    await env.DB.batch([insertFileStatement(env.DB, file('f-archive-6'))]);
    await expect(
      exec(
        `INSERT INTO archive_document_versions VALUES ('v-x', '${id}', 2, 'f-archive-6', 'p', 'now')`,
      ),
    ).rejects.toThrow(/no versions/);
  });

  it('takes uploads only into Governance and General (D-096)', async () => {
    const upload = (id: string, category: string) =>
      exec(
        `INSERT INTO archive_documents (id, unit_id, category_id, source, title, document_date, filed_at, filed_by)
         VALUES ('${id}', '${UNIT}', '${category}', 'upload', 'Constitution', '2026-01-01', 'now', 'p')`,
      );
    await expect(upload('d-up-1', 'events')).rejects.toThrow(/CHECK/);
    await expect(upload('d-up-2', 'governance')).resolves.toBeDefined();
    await expect(upload('d-up-3', 'general')).resolves.toBeDefined();
  });
});
