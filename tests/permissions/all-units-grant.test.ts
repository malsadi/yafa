import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { MeResponse } from '../../src/shared/core/me-response';
import { insertNoticeVersion } from '../app/app-fixtures';
import { insertGrant } from '../core/permissions/permission-fixtures';
import { readyMeetings } from '../api/meeting-recorder/meeting-fixtures';
import {
  call,
  openAccount,
  readyTreasury,
  treasuryOfficer,
  unitPath,
  type Officer,
} from '../api/treasury/treasury-fixtures';

// D-221: a capability granted unit by unit may be granted for all units —
// the owner's "main administrator" role. Its holder works in every unit, as
// the unit's own officers do; the brief's fixed rules still bind them.
const NOTICE = '01ARZ3NDEKTSV4RRFFQ69AUNTV';
const ALL_UNITS = [
  'meeting-recorder.meetings.read',
  'treasury.accounts.read',
  'treasury.debit.create',
  'treasury.debit.approve',
];
let main: Officer;
let own: Officer;
let branch: Officer;

const meetings = (o: Officer, unitId: string) =>
  call(o.clerkUserId, 'GET', `/api/meeting-recorder/units/${unitId}/meetings`);

describe('a capability granted for all units (D-221)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    main = await treasuryOfficer({ suffix: 'AU1', notice: NOTICE, capabilities: [] });
    for (const capability of ALL_UNITS)
      await insertGrant(env.DB, {
        id: `${capability}-AU1`,
        roleId: '01ARZ3NDEKTSV4RRFFQ69ARAU1',
        capability,
        scope: 'all units',
      });
    own = await treasuryOfficer({
      suffix: 'AU2',
      notice: NOTICE,
      capabilities: ['meeting-recorder.meetings.read', 'treasury.accounts.read'],
    });
    branch = await treasuryOfficer({
      suffix: 'AU3',
      notice: NOTICE,
      capabilities: ['treasury.accounts.read', 'treasury.accounts.manage'],
    });
    await readyMeetings(branch.unitId, branch.personId);
    await readyTreasury(branch.unitId, {
      thresholdPence: 100,
      receiptRequired: false,
      actor: branch.personId,
    });
    await openAccount(branch, 'Bank', 10000);
  });

  it("reads another branch's meetings and Treasury, where an own-unit grant can't", async () => {
    expect((await meetings(main, branch.unitId)).status).toBe(200);
    expect(
      (await call(main.clerkUserId, 'GET', `${unitPath(branch.unitId)}/accounts`)).status,
    ).toBe(200);
    expect((await meetings(own, branch.unitId)).status).toBe(403);
    expect((await call(own.clerkUserId, 'GET', `${unitPath(branch.unitId)}/accounts`)).status).toBe(
      403,
    );
  });

  it('still never approves their own payment (17 B5; P7)', async () => {
    const accounts = await (
      await call(main.clerkUserId, 'GET', `${unitPath(branch.unitId)}/accounts`)
    ).json<{ accounts: { id: string }[] }>();
    const debit = await call(main.clerkUserId, 'POST', `${unitPath(branch.unitId)}/debits`, {
      accountId: accounts.accounts[0]?.id ?? '',
      amountPence: 500,
      entryDate: '2026-06-01',
      counterparty: 'Supplier',
      description: 'Hall',
    });
    expect(debit.status).toBe(201);
    const { id } = await debit.json<{ id: string }>();
    const approve = await call(
      main.clerkUserId,
      'POST',
      `${unitPath(branch.unitId)}/entries/${id}/approve`,
      {},
    );
    expect(approve.ok).toBe(false);
  });

  it('offers every unit in the unit switcher, and an own-unit holder only their own', async () => {
    const unitsOf = async (o: Officer) => {
      const me = await (await call(o.clerkUserId, 'GET', '/api/me')).json<MeResponse>();
      return me.status === 'active' ? me.units.map((u) => u.id) : [];
    };
    expect(await unitsOf(main)).toEqual(
      expect.arrayContaining([main.unitId, own.unitId, branch.unitId]),
    );
    expect(await unitsOf(own)).toEqual([own.unitId]);
  });
});
