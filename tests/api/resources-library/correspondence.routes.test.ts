import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { FiledLetterRecord } from '../../../src/shared/resources-library/filed-letter';
import { fileLetter } from '../../../src/worker/services/resources-library';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { fileFor, insertFileStatement } from '../../services/filed-file';
import { call, setDocumentFileRules } from '../documents-archive/archive-fixtures';
import { libraryOfficer, type Officer } from './library-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69LCNV';
const READ = 'resources-library.correspondence.read';
let branch: Officer;
let national: Officer;

const letters = (officer: Officer, unitId: string, direction: string) =>
  call(officer.clerkUserId, 'GET', `/api/resources-library/units/${unitId}/letters/${direction}`);

describe('letters out and in in the library (brief 16 D2, D3; 7.3)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    branch = await libraryOfficer({ suffix: 'LC1', notice: NOTICE, capabilities: [READ] });
    national = await libraryOfficer({
      suffix: 'LC2',
      notice: NOTICE,
      unitType: 'national',
      capabilities: [READ],
    });
    await setDocumentFileRules(branch.personId);
    const file = { ...fileFor(branch.unitId, 'f-letter-out', true), key: 'LC1/letter.pdf' };
    await env.FILES.put(file.key, 'letter', { httpMetadata: { contentType: 'application/pdf' } });
    await env.DB.batch([
      insertFileStatement(env.DB, file),
      fileLetter(env.DB, 'out', { file, referenceNumber: 'LC1/001', letterId: 'letter-1' }),
    ]);
  });

  it("lists a unit's own letters, read-only, and downloads them", async () => {
    const out = await (await letters(branch, branch.unitId, 'out')).json<FiledLetterRecord[]>();
    expect(out).toMatchObject([{ referenceNumber: 'LC1/001', fileName: 'document.pdf' }]);
    expect(await (await letters(branch, branch.unitId, 'in')).json()).toEqual([]);
    const file = await call(
      branch.clerkUserId,
      'GET',
      `/api/resources-library/units/${branch.unitId}/letters/out/${out[0]?.id ?? ''}/file`,
    );
    expect(await file.text()).toBe('letter');
  });

  it("never shows a branch's letters to another unit, the General Council included", async () => {
    expect((await letters(national, branch.unitId, 'out')).status).toBe(403);
  });

  it('knows only letters out and in', async () => {
    expect((await letters(branch, branch.unitId, 'sideways')).status).toBe(400);
  });
});
