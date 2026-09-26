import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { LetterTemplatesView } from '../../../src/shared/resources-library/letter-template';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { call } from '../documents-archive/archive-fixtures';
import { libraryOfficer, type Officer } from './library-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69LTNV';
const READ = 'resources-library.library.read';
const MANAGE = 'resources-library.letter-templates.manage';
let national: Officer;
let branchA: Officer;
let branchB: Officer;
let switchedOff: Officer;

const TEMPLATE = {
  title: 'Venue thanks',
  subject: 'Thank you, {{venue}}',
  body: 'Dear {{contact}},\n\nThank you for hosting us.',
  fields: ['venue', 'contact'],
  language: 'en',
};
const path = (unitId: string) => `/api/resources-library/units/${unitId}/letter-templates`;
const view = async (officer: Officer) =>
  (await call(officer.clerkUserId, 'GET', path(officer.unitId))).json<LetterTemplatesView>();
const titles = async (officer: Officer) =>
  (await view(officer)).templates.map((t) => t.title).sort();

describe('letter templates (brief 16 D1; 7.3; P19; D-100, D-101)', () => {
  let nationalId = '';
  let branchId = '';

  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    national = await libraryOfficer({
      suffix: 'LT1',
      notice: NOTICE,
      unitType: 'national',
      capabilities: [READ, MANAGE],
    });
    branchA = await libraryOfficer({ suffix: 'LT2', notice: NOTICE, capabilities: [READ, MANAGE] });
    branchB = await libraryOfficer({ suffix: 'LT3', notice: NOTICE, capabilities: [READ] });
    switchedOff = await libraryOfficer({
      suffix: 'LT4',
      notice: NOTICE,
      capabilities: [READ],
      libraryOn: false,
    });
    const created = async (officer: Officer, title: string) => {
      const res = await call(officer.clerkUserId, 'POST', path(officer.unitId), {
        ...TEMPLATE,
        title,
      });
      expect(res.status).toBe(201);
      return (await res.json<{ id: string }>()).id;
    };
    nationalId = await created(national, 'National template');
    branchId = await created(branchA, 'Branch A template');
  });

  it("shares national templates with every branch, and keeps a branch's to that branch", async () => {
    expect(await titles(branchA)).toEqual(['Branch A template', 'National template']);
    expect(await titles(branchB)).toEqual(['National template']);
    expect(await titles(national)).toEqual(['National template']);
    const b = await view(branchB);
    expect(b.templates[0]).toMatchObject({
      national: true,
      fields: ['venue', 'contact'],
      version: 1,
    });
  });

  it('is hidden where the library is switched off, and refuses writing without the capability', async () => {
    expect((await call(switchedOff.clerkUserId, 'GET', path(switchedOff.unitId))).status).toBe(404);
    expect((await call(branchB.clerkUserId, 'POST', path(branchB.unitId), TEMPLATE)).status).toBe(
      403,
    );
  });

  it('keeps a template with no subject as having none (D-112)', async () => {
    const res = await call(branchA.clerkUserId, 'POST', path(branchA.unitId), {
      ...TEMPLATE,
      title: 'No subject',
      subject: '   ',
    });
    expect(res.status).toBe(201);
    const saved = (await view(branchA)).templates.find((t) => t.title === 'No subject');
    expect(saved?.subject).toBeNull();
    const omitted = await call(branchA.clerkUserId, 'POST', path(branchA.unitId), {
      title: 'Subject left out',
      body: TEMPLATE.body,
      fields: TEMPLATE.fields,
      language: TEMPLATE.language,
    });
    expect(omitted.status).toBe(201);
  });

  it('refuses a field used but not listed, and a field listed twice (D-101)', async () => {
    const post = (body: object) => call(branchA.clerkUserId, 'POST', path(branchA.unitId), body);
    expect((await post({ ...TEMPLATE, body: 'Dear {{someone}}' })).status).toBe(400);
    expect((await post({ ...TEMPLATE, fields: ['venue', 'contact', 'venue'] })).status).toBe(400);
  });

  it('saves a change made from the current version, and refuses one made from an older one (9.1)', async () => {
    const put = (version: number, title: string) =>
      call(branchA.clerkUserId, 'PUT', `${path(branchA.unitId)}/${branchId}`, {
        version,
        template: { ...TEMPLATE, title },
      });
    expect((await put(1, 'Branch A letter')).status).toBe(204);
    const stale = await put(1, 'Someone else');
    expect(stale.status).toBe(409);
    expect(await stale.json()).toMatchObject({ error: { code: 'resources-library.stale' } });
  });

  it("never lets a branch change the General Council's template", async () => {
    const body = { version: 1, template: TEMPLATE };
    expect(
      (await call(branchA.clerkUserId, 'PUT', `${path(branchA.unitId)}/${nationalId}`, body))
        .status,
    ).toBe(404);
    expect(
      (await call(branchA.clerkUserId, 'PUT', `${path(national.unitId)}/${nationalId}`, body))
        .status,
    ).toBe(403);
  });

  it('retires a template and brings it back, never deleting it (D-100)', async () => {
    const one = `${path(national.unitId)}/${nationalId}`;
    expect((await call(national.clerkUserId, 'POST', `${one}/retire`, { version: 1 })).status).toBe(
      204,
    );
    expect(await titles(branchB)).toEqual([]);
    expect((await view(national)).templates[0]?.retiredAt).not.toBeNull();
    expect(
      (await call(national.clerkUserId, 'POST', `${one}/restore`, { version: 2 })).status,
    ).toBe(204);
    expect(await titles(branchB)).toEqual(['National template']);
    await expect(
      env.DB.prepare('DELETE FROM library_letter_templates WHERE id = ?').bind(nationalId).run(),
    ).rejects.toThrow(/never deleted/);
  });
});
