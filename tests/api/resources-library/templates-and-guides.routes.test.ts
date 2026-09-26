import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { ResourceRecord } from '../../../src/shared/resources-library/resource';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { call, setDocumentFileRules } from '../documents-archive/archive-fixtures';
import { libraryOfficer, type Officer } from './library-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69LRNV';
const READ = 'resources-library.library.read';
const MANAGE = 'resources-library.resources.manage';
let national: Officer;
let branch: Officer;
let otherBranch: Officer;

const base = (unitId: string) => `/api/resources-library/units/${unitId}/resources`;
const code = (o: Officer) => `app-branch-${o.clerkUserId.slice(-3)}`;

/** Start, put the file where the browser would, then complete (9.3). */
async function upload(
  officer: Officer,
  start: string,
  complete: (id: string) => string,
  body: object,
  text: string,
) {
  const res = await call(officer.clerkUserId, 'POST', start, {
    fileName: 'form.pdf',
    size: text.length,
    contentType: 'application/pdf',
  });
  if (!res.ok) return res;
  const started = await res.json<{ resourceId?: string; fileId: string }>();
  const recordId = started.resourceId ?? complete('').split('/resources/')[1]?.split('/')[0] ?? '';
  await env.FILES.put(
    `${code(officer)}/resources-library/${recordId}/${started.fileId}-form.pdf`,
    text,
    {
      httpMetadata: { contentType: 'application/pdf' },
    },
  );
  return call(officer.clerkUserId, 'PUT', complete(started.resourceId ?? ''), {
    fileId: started.fileId,
    fileName: 'form.pdf',
    ...body,
  });
}

const add = (officer: Officer, title: string, kind = 'template') =>
  upload(
    officer,
    `${base(officer.unitId)}/uploads`,
    (id) => `${base(officer.unitId)}/${id}`,
    { kind, title, description: '', language: 'en' },
    `${title} v1`,
  );
const list = async (officer: Officer) =>
  (await call(officer.clerkUserId, 'GET', base(officer.unitId))).json<ResourceRecord[]>();

describe('templates and guides (brief 16 A1 to A3; D-100, D-103, D-104, D-106)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    national = await libraryOfficer({
      suffix: 'LR1',
      notice: NOTICE,
      unitType: 'national',
      capabilities: [READ, MANAGE],
    });
    branch = await libraryOfficer({ suffix: 'LR2', notice: NOTICE, capabilities: [READ, MANAGE] });
    otherBranch = await libraryOfficer({ suffix: 'LR3', notice: NOTICE, capabilities: [READ] });
    await setDocumentFileRules(national.personId);
    expect((await add(national, 'Sign-in sheet')).status).toBe(201);
    expect((await add(branch, 'Role handbook', 'guide')).status).toBe(201);
  });

  it("shares the General Council's with every branch, and keeps a branch's to itself", async () => {
    expect((await list(branch)).map((r) => [r.title, r.kind, r.national])).toEqual([
      ['Role handbook', 'guide', false],
      ['Sign-in sheet', 'template', true],
    ]);
    expect((await list(otherBranch)).map((r) => r.title)).toEqual(['Sign-in sheet']);
    expect((await list(branch))[0]).toMatchObject({
      description: null,
      language: 'en',
      fileName: 'form.pdf',
      version: 1,
    });
  });

  it('refuses adding without the capability', async () => {
    expect((await add(otherBranch, 'Poster')).status).toBe(403);
  });

  it('replaces the file, keeping the old one stored and recorded (D-104)', async () => {
    const [handbook] = await list(branch);
    const one = `${base(branch.unitId)}/${handbook?.id ?? ''}`;
    const res = await upload(
      branch,
      `${one}/file/uploads`,
      () => `${one}/file`,
      { version: 1 },
      'handbook v2',
    );
    expect(res.status).toBe(204);
    expect(await (await call(branch.clerkUserId, 'GET', `${one}/file`)).text()).toBe('handbook v2');
    const files = await env.DB.prepare(
      "SELECT key FROM files WHERE service = 'resources-library' AND record_id = ?",
    )
      .bind(handbook?.id ?? '')
      .all<{ key: string }>();
    expect(files.results).toHaveLength(2);
    for (const { key } of files.results) expect(await env.FILES.head(key)).not.toBeNull();
  });

  it('changes the details from the version read, refusing a stale save (9.1)', async () => {
    const [handbook] = await list(branch);
    const one = `${base(branch.unitId)}/${handbook?.id ?? ''}`;
    const details = { title: 'Role handbook', description: 'For new officers', language: 'ar' };
    expect((await call(branch.clerkUserId, 'PATCH', one, { version: 2, details })).status).toBe(
      204,
    );
    expect((await call(branch.clerkUserId, 'PATCH', one, { version: 2, details })).status).toBe(
      409,
    );
    expect((await list(branch))[0]).toMatchObject({
      description: 'For new officers',
      language: 'ar',
      version: 3,
    });
  });

  it('retires one, hiding it and its file from others, and brings it back (D-100)', async () => {
    const sheet = (await list(national))[0];
    const one = `${base(national.unitId)}/${sheet?.id ?? ''}`;
    expect((await call(national.clerkUserId, 'POST', `${one}/retire`, { version: 1 })).status).toBe(
      204,
    );
    expect((await list(otherBranch)).map((r) => r.title)).toEqual([]);
    const viaBranch = `${base(otherBranch.unitId)}/${sheet?.id ?? ''}/file`;
    expect((await call(otherBranch.clerkUserId, 'GET', viaBranch)).status).toBe(404);
    expect(
      (await call(national.clerkUserId, 'POST', `${one}/restore`, { version: 2 })).status,
    ).toBe(204);
    expect(await (await call(otherBranch.clerkUserId, 'GET', viaBranch)).text()).toBe(
      'Sign-in sheet v1',
    );
    await expect(
      env.DB.prepare('DELETE FROM library_resources WHERE id = ?')
        .bind(sheet?.id ?? '')
        .run(),
    ).rejects.toThrow(/never deleted/);
  });
});
