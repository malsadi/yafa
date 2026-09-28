import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type {
  AchievementRecord,
  Contribution,
} from '../../../src/shared/achievements-and-reports/achievement-records';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  achievementBody,
  achievementOfficer,
  addCategory,
  call,
  colleagueOf,
  READ,
  readyAchievements,
  RECORD,
  unitPath,
  type Officer,
} from './achievement-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69ACNTV';
const CATEGORY = 'cat-AC-youth';
let recorder: Officer;
let reader: Officer;
let pastOfficer: Officer;
let council: Officer;
let otherBranch: Officer;

const timeline = async (officer: Officer, scope = 'unit') =>
  (
    await call(
      officer.clerkUserId,
      'GET',
      `${unitPath(officer.unitId)}/achievements?scope=${scope}`,
    )
  )
    .json<{ items: AchievementRecord[] }>()
    .then((page) => page.items);
const record = (officer: Officer, body: object) =>
  call(officer.clerkUserId, 'POST', `${unitPath(officer.unitId)}/achievements`, body);

describe('achievements and the timeline (brief 24 A1 to A3, B1; D-215)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    recorder = await achievementOfficer({
      suffix: 'AC1',
      notice: NOTICE,
      capabilities: [READ, RECORD],
    });
    reader = await colleagueOf(recorder, { suffix: 'AC2', notice: NOTICE, capabilities: [READ] });
    pastOfficer = await colleagueOf(recorder, { suffix: 'AC3', notice: NOTICE, capabilities: [] });
    await env.DB.prepare("UPDATE terms SET end_date = '2026-02-01' WHERE person_id = ?")
      .bind(pastOfficer.personId)
      .run();
    council = await achievementOfficer({
      suffix: 'AC4',
      notice: NOTICE,
      capabilities: [READ, RECORD],
      unitType: 'national',
    });
    otherBranch = await achievementOfficer({
      suffix: 'AC5',
      notice: NOTICE,
      capabilities: [READ, RECORD],
    });
    for (const officer of [recorder, council, otherBranch])
      await readyAchievements(officer.unitId, officer.personId);
    await addCategory(CATEGORY, 'Youth');
  });

  it('records an achievement credited to officers, past officers included (A1, O-151)', async () => {
    const res = await record(
      recorder,
      achievementBody({
        categoryItemId: CATEGORY,
        officers: [reader.personId, pastOfficer.personId],
      }),
    );
    expect(res.status).toBe(201);
    const [first] = await timeline(reader);
    expect(first).toMatchObject({
      title: 'Fictional youth award (test)',
      categoryNameEn: 'Youth',
      locked: false,
    });
    expect(first?.officers.map((o) => o.personId).sort()).toEqual(
      [reader.personId, pastOfficer.personId].sort(),
    );
  });

  it('refuses a future date, a category not in the list, someone who never served here, or no capability', async () => {
    const body = achievementBody({ categoryItemId: CATEGORY, officers: [reader.personId] });
    const code = async (b: object) =>
      (await (await record(recorder, b)).json<{ error: { code: string } }>()).error.code;
    expect(await code({ ...body, date: '2999-01-01' })).toBe(
      'achievements-and-reports.future-date',
    );
    expect(await code({ ...body, categoryItemId: 'nope' })).toBe(
      'achievements-and-reports.category-not-in-list',
    );
    expect(await code({ ...body, officerPersonIds: [otherBranch.personId] })).toBe(
      'achievements-and-reports.not-an-officer',
    );
    expect((await record(reader, body)).status).toBe(403);
  });

  it('shows a branch its own and the General Council’s; only the Council sees every branch (A3, O-150)', async () => {
    await record(
      council,
      achievementBody({
        categoryItemId: CATEGORY,
        officers: [council.personId],
        title: 'Council award',
      }),
    );
    await record(
      otherBranch,
      achievementBody({
        categoryItemId: CATEGORY,
        officers: [otherBranch.personId],
        title: 'Other award',
      }),
    );
    expect((await timeline(reader, 'national')).map((a) => a.title)).toEqual(['Council award']);
    expect(
      (await call(reader.clerkUserId, 'GET', `${unitPath(reader.unitId)}/achievements?scope=all`))
        .status,
    ).toBe(403);
    const all = (await timeline(council, 'all')).map((a) => a.title).sort();
    expect(all).toEqual(['Council award', 'Fictional youth award (test)', 'Other award']);
  });

  it('withdraws and brings back, showing a withdrawn one only to recorders, and refuses a stale change (O-152; 9.1)', async () => {
    const [mine] = await timeline(recorder);
    const one = `${unitPath(recorder.unitId)}/achievements/${mine?.id ?? ''}`;
    expect(
      (await call(recorder.clerkUserId, 'POST', `${one}/withdraw`, { version: mine?.version }))
        .status,
    ).toBe(204);
    expect(await timeline(reader)).toEqual([]);
    expect((await timeline(recorder))[0]?.withdrawnAt).not.toBeNull();
    const stale = await call(recorder.clerkUserId, 'POST', `${one}/restore`, {
      version: mine?.version,
    });
    expect(await stale.json()).toEqual({ error: { code: 'achievements-and-reports.stale' } });
    expect(
      (
        await call(recorder.clerkUserId, 'POST', `${one}/restore`, {
          version: (mine?.version ?? 0) + 1,
        })
      ).status,
    ).toBe(204);
  });

  it('shows a person’s roles held and the achievements credited, past officers too (B1, O-153)', async () => {
    const res = await call(
      reader.clerkUserId,
      'GET',
      `${unitPath(reader.unitId)}/contributions/${pastOfficer.personId}`,
    );
    const c = await res.json<Contribution>();
    expect(c.terms).toEqual([
      expect.objectContaining({ roleNameEn: 'Role AC3', endDate: '2026-02-01' }),
    ]);
    expect(c.achievements.map((a) => a.title)).toEqual(['Fictional youth award (test)']);
    const elsewhere = await call(
      otherBranch.clerkUserId,
      'GET',
      `${unitPath(otherBranch.unitId)}/contributions/${pastOfficer.personId}`,
    );
    expect(elsewhere.status).toBe(404);
    const fromCouncil = await call(
      council.clerkUserId,
      'GET',
      `${unitPath(council.unitId)}/contributions/${pastOfficer.personId}`,
    );
    expect((await fromCouncil.json<Contribution>()).achievements).toHaveLength(1);
  });

  it('is never deleted, in the database', async () => {
    await expect(env.DB.prepare('DELETE FROM achievements').run()).rejects.toThrow(/never deleted/);
  });
});
