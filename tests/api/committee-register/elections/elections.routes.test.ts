import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { RoleDesignation } from '../../../../src/shared/committee-register/role-designation';
import { setSetting } from '../../../../src/worker/core/settings';
import { insertGrant, insertRole, insertTerm } from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  fakeClerk,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69ELNV';
const CHAIR = '01ARZ3NDEKTSV4RRFFQ69ELCH';
const clerk = fakeClerk();

interface Person {
  clerkUserId: string;
  personId: string;
  unitId: string;
}
interface Election {
  id: string;
  status: string;
  positions: { id: string; candidates: { id: string; personId: string }[] }[];
}
let bro: Person;
let chair: Person;
let member: Person;
let electionId = '';

async function call(person: Person, method: string, path: string, body?: unknown) {
  const { app, tokenFor } = await buildTestApp({}, clerk);
  return app.request(`${ORIGIN}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await tokenFor(person.clerkUserId)}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const election = async () =>
  (await call(bro, 'GET', `/api/committee-register/elections/${electionId}`)).json<Election>();
const errorOf = async (res: Response) =>
  (await res.json<{ error?: { code: string } }>()).error?.code;

// Tests build on each other in order within this file's shared storage.
describe('elections (brief 14 C1; P3; D-055, D-066, D-068)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    await insertRole(env.DB, { id: CHAIR, name: 'Chair' });
    bro = await seedOfficer({ suffix: 'EL1', designation: RoleDesignation.BranchRegisterOfficer });
    await insertGrant(env.DB, {
      id: 'el-confirm',
      roleId: 'designated-branch-register-officer',
      capability: 'committee-register.elections.confirm',
      scope: 'own unit',
    });
    chair = await seedOfficer({ suffix: 'EL2' });
    member = await seedOfficer({ suffix: 'EL3' });
    await insertTerm(env.DB, {
      id: 'el-chair-term',
      personId: chair.personId,
      roleId: CHAIR,
      unitId: bro.unitId,
      startDate: '2025-01-01',
    });
    for (const p of [bro, chair, member]) await acknowledgeNotice(p.personId, NOTICE);
    await buildTestApp({}, clerk);
    await setSetting(env.DB, {
      key: 'administration-panel.new_officer_language',
      value: 'en',
      actorPersonId: bro.personId,
    });
  });

  it('records a Draft with a position and candidates, a new one created without access (P3)', async () => {
    const created = await (
      await call(bro, 'POST', `/api/committee-register/units/${bro.unitId}/elections`, {
        electionDate: '2026-03-01',
      })
    ).json<Election>();
    electionId = created.id;
    const withPosition = await (
      await call(bro, 'POST', `/api/committee-register/elections/${electionId}/positions`, {
        roleId: CHAIR,
        seats: 1,
      })
    ).json<Election>();
    const positionId = withPosition.positions[0]?.id ?? '';
    await call(
      bro,
      'POST',
      `/api/committee-register/elections/${electionId}/positions/${positionId}/candidates`,
      { personId: chair.personId },
    );
    await call(
      bro,
      'POST',
      `/api/committee-register/elections/${electionId}/positions/${positionId}/candidates`,
      {
        newPerson: {
          name: 'Nadia Example',
          email: 'nadia.example@example.org',
          phone: '07700 900777',
        },
      },
    );
    const nadia = await env.DB.prepare(
      "SELECT id FROM people WHERE email = 'nadia.example@example.org'",
    ).first<{ id: string }>();
    const nadiaTerms = await env.DB.prepare('SELECT COUNT(*) AS n FROM terms WHERE person_id = ?')
      .bind(nadia?.id)
      .first<{ n: number }>();

    expect(created.status).toBe('Draft');
    expect((await election()).positions[0]?.candidates).toHaveLength(2);
    expect(nadiaTerms?.n).toBe(0);
    expect(clerk.invited).toEqual([]);
  });

  it('refuses to confirm until results are complete, seats exactly filled, and the start not before the vote', async () => {
    const confirm = (termsStartDate: string) =>
      call(bro, 'POST', `/api/committee-register/elections/${electionId}/confirm`, {
        termsStartDate,
      });
    expect(await errorOf(await confirm('2026-04-01'))).toBe('elections.results-incomplete');

    const candidates = (await election()).positions[0]?.candidates ?? [];
    const results = candidates.map((c) => ({
      candidateId: c.id,
      votes: c.personId === chair.personId ? 10 : 25,
      elected: true,
    }));
    await call(bro, 'PUT', `/api/committee-register/elections/${electionId}/results`, { results });
    expect(await errorOf(await confirm('2026-04-01'))).toBe('elections.seats-not-filled');

    await call(bro, 'PUT', `/api/committee-register/elections/${electionId}/results`, {
      results: results.map((r) => ({ ...r, elected: r.votes === 25 })),
    });
    expect(await errorOf(await confirm('2026-02-01'))).toBe('elections.start-before-election');
  });

  it('confirms: outgoing terms end on the new start, the elected begin on it, and the new officer is invited', async () => {
    const res = await call(bro, 'POST', `/api/committee-register/elections/${electionId}/confirm`, {
      termsStartDate: '2026-04-01',
    });
    const oldTerm = await env.DB.prepare(
      "SELECT end_date AS endDate FROM terms WHERE id = 'el-chair-term'",
    ).first<{ endDate: string }>();
    const newTerm = await env.DB.prepare(
      "SELECT t.start_date AS startDate, t.end_date AS endDate FROM terms t JOIN people p ON p.id = t.person_id WHERE p.email = 'nadia.example@example.org'",
    ).first<{ startDate: string; endDate: string | null }>();

    expect((await res.json<Election>()).status).toBe('Confirmed');
    expect(oldTerm?.endDate).toBe('2026-04-01');
    expect(newTerm).toEqual({ startDate: '2026-04-01', endDate: null });
    expect(clerk.invited).toEqual(['nadia.example@example.org']);
  });

  it('locks a confirmed election, in the service and in the database', async () => {
    const positionId = (await election()).positions[0]?.id ?? '';

    expect(
      await errorOf(
        await call(bro, 'POST', `/api/committee-register/elections/${electionId}/positions`, {
          roleId: CHAIR,
          seats: 1,
        }),
      ),
    ).toBe('elections.confirmed-is-locked');
    expect(
      await errorOf(
        await call(bro, 'POST', `/api/committee-register/elections/${electionId}/confirm`, {
          termsStartDate: '2026-04-01',
        }),
      ),
    ).toBe('elections.confirmed-is-locked');
    await expect(
      env.DB.prepare("UPDATE elections SET election_date = '2026-03-02' WHERE id = ?")
        .bind(electionId)
        .run(),
    ).rejects.toThrow(/locked/);
    await expect(
      env.DB.prepare('DELETE FROM election_positions WHERE id = ?').bind(positionId).run(),
    ).rejects.toThrow(/locked/);
    await expect(
      env.DB.prepare('DELETE FROM elections WHERE id = ?').bind(electionId).run(),
    ).rejects.toThrow(/never deleted/);
  });

  it('records a correction only as a new election referring to a confirmed one', async () => {
    const correction = await call(
      bro,
      'POST',
      `/api/committee-register/units/${bro.unitId}/elections`,
      { electionDate: '2026-03-01', correctsElectionId: electionId },
    );
    const draft = await correction.json<Election>();
    const ofDraft = await call(
      bro,
      'POST',
      `/api/committee-register/units/${bro.unitId}/elections`,
      { electionDate: '2026-03-01', correctsElectionId: draft.id },
    );

    expect(correction.status).toBe(201);
    expect(await errorOf(ofDraft)).toBe('elections.corrects-must-be-confirmed-of-unit');
  });

  it('refuses recording to those without the register power, and confirming without the matrix grant', async () => {
    expect(
      (
        await call(member, 'POST', `/api/committee-register/units/${bro.unitId}/elections`, {
          electionDate: '2026-05-01',
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await call(member, 'POST', `/api/committee-register/elections/${electionId}/confirm`, {
          termsStartDate: '2026-05-01',
        })
      ).status,
    ).toBe(403);
  });
});
