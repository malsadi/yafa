import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { ArchiveDocumentSummary } from '../../../src/shared/documents-archive/archive-document';
import { insertGrant } from '../../core/permissions/permission-fixtures';
import { acknowledgeNotice, insertNoticeVersion, seedOfficer } from '../../app/app-fixtures';
import { call, fileAutomatically, setDocumentFileRules } from './archive-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69ARFNV';
type Officer = Awaited<ReturnType<typeof seedOfficer>>;
let national: Officer;
let branchA: Officer;
let branchB: Officer;
let noRead: Officer;

async function reader(suffix: string, unitType: 'national' | 'branch' = 'branch') {
  const officer = await seedOfficer({ suffix, unitType });
  await acknowledgeNotice(officer.personId, NOTICE);
  await insertGrant(env.DB, {
    id: `read-${suffix}`,
    roleId: `01ARZ3NDEKTSV4RRFFQ69AR${suffix}`,
    capability: 'documents-archive.documents.read',
    scope: 'own unit',
  });
  return officer;
}

async function titlesFor(officer: Officer, query = '') {
  const res = await call(officer.clerkUserId, 'GET', `/api/documents-archive/documents${query}`);
  return (await res.json<ArchiveDocumentSummary[]>()).map((d) => d.title).sort();
}

describe('finding archived documents (brief 15 A5, B1, B2; 7.3; P2; D-097)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    national = await reader('AF1', 'national');
    branchA = await reader('AF2');
    branchB = await reader('AF3');
    noRead = await seedOfficer({ suffix: 'AF4' });
    await acknowledgeNotice(noRead.personId, NOTICE);
    await setDocumentFileRules(national.personId);
    for (const [officer, recordId, title, categoryId, documentDate] of [
      [national, 'rec-gc', 'National meeting report', 'meetings', '2026-03-01'],
      [branchA, 'rec-a', 'Branch A statement', 'finance', '2026-04-01'],
      [branchB, 'rec-b', 'Branch B meeting report', 'meetings', '2026-05-01'],
    ] as const) {
      await fileAutomatically({
        unitId: officer.unitId,
        unitCode: `app-branch-${officer.clerkUserId.slice(-3)}`,
        recordId,
        title,
        categoryId,
        documentDate,
        filedBy: officer.personId,
      });
    }
  });

  it("shows a branch its own documents and the General Council's, never another branch's", async () => {
    expect(await titlesFor(branchA)).toEqual(['Branch A statement', 'National meeting report']);
  });

  it("shows the General Council every branch's documents (P2)", async () => {
    expect(await titlesFor(national)).toEqual([
      'Branch A statement',
      'Branch B meeting report',
      'National meeting report',
    ]);
  });

  it('lists the units whose documents the officer sees, to search by branch', async () => {
    const res = await call(branchA.clerkUserId, 'GET', '/api/documents-archive/units');
    const ids = (await res.json<{ id: string }[]>()).map((unit) => unit.id).sort();
    expect(ids).toEqual([branchA.unitId, national.unitId].sort());
  });

  it('refuses an officer who may not read the archive', async () => {
    const res = await call(noRead.clerkUserId, 'GET', '/api/documents-archive/documents');
    expect(res.status).toBe(403);
  });

  it('searches by title, category, branch, and either date', async () => {
    expect(await titlesFor(national, '?title=meeting')).toEqual([
      'Branch B meeting report',
      'National meeting report',
    ]);
    expect(await titlesFor(national, '?categoryId=finance')).toEqual(['Branch A statement']);
    expect(await titlesFor(national, `?unitId=${branchB.unitId}`)).toEqual([
      'Branch B meeting report',
    ]);
    expect(await titlesFor(national, '?dateField=document&from=2026-03-15&to=2026-04-15')).toEqual([
      'Branch A statement',
    ]);
    const today = new Date().toISOString().slice(0, 10);
    expect(await titlesFor(branchA, `?dateField=filed&from=${today}&to=${today}`)).toHaveLength(2);
    expect(await titlesFor(branchA, '?dateField=filed&to=2020-01-01')).toEqual([]);
  });

  it('opens and downloads only documents the officer may see', async () => {
    const [bDoc] = await (
      await call(
        national.clerkUserId,
        'GET',
        `/api/documents-archive/documents?unitId=${branchB.unitId}`,
      )
    ).json<ArchiveDocumentSummary[]>();
    const path = `/api/documents-archive/documents/${bDoc?.id ?? ''}`;

    const opened = await call(national.clerkUserId, 'GET', path);
    expect(await opened.json()).toMatchObject({ source: 'automatic', versions: [{ version: 1 }] });
    const file = await call(national.clerkUserId, 'GET', `${path}/versions/1/file`);
    expect(await file.text()).toBe('report');

    expect((await call(branchA.clerkUserId, 'GET', path)).status).toBe(404);
    expect((await call(branchA.clerkUserId, 'GET', `${path}/versions/1/file`)).status).toBe(404);
  });
});
