import { beforeAll, describe, expect, it } from 'vitest';
import { RoleDesignation } from '../../../../src/shared/committee-register/role-designation';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69RUNV';

async function active(params: Parameters<typeof seedOfficer>[0]) {
  const officer = await seedOfficer(params);
  await acknowledgeNotice(officer.personId, NOTICE);
  return officer;
}

async function unitIdsFor(clerkUserId: string) {
  const { app, tokenFor } = await buildTestApp();
  const res = await app.request(`${ORIGIN}/api/committee-register/units`, {
    headers: { Authorization: `Bearer ${await tokenFor(clerkUserId)}` },
  });
  return (await res.json<{ id: string }[]>()).map((unit) => unit.id).sort();
}

describe('the units whose register an officer may open (brief 14)', () => {
  let bro: Awaited<ReturnType<typeof active>>;
  let nro: Awaited<ReturnType<typeof active>>;
  let member: Awaited<ReturnType<typeof active>>;

  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    bro = await active({ suffix: 'RU1', designation: RoleDesignation.BranchRegisterOfficer });
    nro = await active({
      suffix: 'RU2',
      unitType: 'national',
      designation: RoleDesignation.NationalRegisterOfficer,
    });
    member = await active({ suffix: 'RU3' });
  });

  it("gives a branch register officer their own branch's register only", async () => {
    expect(await unitIdsFor(bro.clerkUserId)).toEqual([bro.unitId]);
  });

  it('gives the national register officer every unit', async () => {
    expect(await unitIdsFor(nro.clerkUserId)).toEqual(
      [bro.unitId, nro.unitId, member.unitId].sort(),
    );
  });

  it('gives an officer with no register power nothing', async () => {
    expect(await unitIdsFor(member.clerkUserId)).toEqual([]);
  });
});
