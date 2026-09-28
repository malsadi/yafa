import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { ImportReport } from '../../../../src/shared/administration-panel/data-import';
import { insertNoticeVersion } from '../../../app/app-fixtures';
import { insertGrant } from '../../../core/permissions/permission-fixtures';
import { call, operationsOfficer, P, set } from './operations-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69IMNTV';
let admin: Awaited<ReturnType<typeof operationsOfficer>>;
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());

const UNITS = `type,code,name_en,name_ar,area,status
national,app-branch-IM1,Council,المجلس,,active
branch,IMP-NTH,Fictional North (test),الشمال التجريبي,Northtown,active`;
const PEOPLE = `email,name,phone,system_administrator,role,unit_code,start_date,end_date
chair.im@example.org,Fictional Chair,07700 900100,no,Role IM1,IMP-NTH,2024-01-01,2025-01-01
chair.im@example.org,Fictional Chair,07700 900100,no,Role IM1,IMP-NTH,2025-01-02,`;
const ACCOUNTS = `unit_code,name,account_type
IMP-NTH,Fictional Bank (test),bank`;
const files = { units: UNITS, people: PEOPLE, accounts: ACCOUNTS };

const dryRun = async (body: object) =>
  (await call(admin.clerkUserId, 'POST', `${P}/data-import/dry-run`, body)).json<ImportReport>();
const run = async (body: object) =>
  (await call(admin.clerkUserId, 'POST', `${P}/data-import`, body)).json<{
    report: ImportReport;
    imported: boolean;
  }>();

describe('the data import (brief 25 D4, 15 D4; D-217)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await operationsOfficer({
      suffix: 'IM1',
      notice: NOTICE,
      capabilities: ['administration-panel.data-import.run'],
      unitType: 'national',
    });
    // The role the people file names is a standard role (no unit of its own).
    await env.DB.prepare(
      "UPDATE roles SET unit_id = NULL WHERE id = '01ARZ3NDEKTSV4RRFFQ69ARIM1'",
    ).run();
  });

  it('refuses a system administrator, an unknown role or unit, and a wrong header, writing nothing', async () => {
    const report = await dryRun({
      units: 'code,name\nX,Y',
      people: `${PEOPLE.split('\n')[0] ?? ''}\nx@example.org,X,1,yes,Nope,NOPE,2024-01-01,`,
      accounts: null,
    });
    expect(report.errors).toEqual([
      'units.csv: the first row must be exactly: type,code,name_en,name_ar,area,status',
      expect.stringMatching(
        /^people\.csv row 2: .*this must be no; unit_code NOPE is not a unit\.$/,
      ),
    ]);
  });

  it('waits for the language new officers start with before adding anyone', async () => {
    const report = await dryRun(files);
    expect(report.errors).toEqual([
      '"Language new officers start with" is not set yet, so no one can be added.',
    ]);
    await set('administration-panel.new_officer_language', 'en', admin.personId);
  });

  it('shows what it would add and what is there, then imports it — past terms too, no invitation', async () => {
    const report = await dryRun(files);
    expect(report).toMatchObject({
      errors: [],
      units: { added: ['IMP-NTH'], present: ['app-branch-IM1'] },
      people: { added: ['chair.im@example.org'], present: [] },
      terms: { added: 2, present: 0 },
      accounts: { added: ['IMP-NTH: Fictional Bank (test)'], present: [] },
    });
    expect((await run(files)).imported).toBe(true);
    const person = await env.DB.prepare(
      "SELECT clerk_user_id AS clerk FROM people WHERE email = 'chair.im@example.org'",
    ).first();
    expect(person).toEqual({ clerk: null });
  });

  it('is safe to run again: everything is already there and left alone (O-165)', async () => {
    const again = await run(files);
    expect(again.report).toMatchObject({
      units: { added: [], present: ['app-branch-IM1', 'IMP-NTH'] },
      people: { added: [], present: ['chair.im@example.org'] },
      terms: { added: 0, present: 2 },
      accounts: { added: [], present: ['IMP-NTH: Fictional Bank (test)'] },
    });
  });

  it('imports no opening balance; the treasurer enters it once in the Treasury (O-166)', async () => {
    const branch = await env.DB.prepare("SELECT id FROM units WHERE code = 'IMP-NTH'").first<{
      id: string;
    }>();
    const unitId = branch?.id ?? '';
    await env.DB.prepare(
      "INSERT INTO service_switches (service, scope, enabled, updated_at, updated_by) VALUES ('treasury', ?, 1, 'now', 'test')",
    )
      .bind(unitId)
      .run();
    await set('treasury.financial_year_start', { month: 1, day: 1 }, admin.personId);
    await insertGrant(env.DB, {
      id: 'tr-read-IM1',
      roleId: '01ARZ3NDEKTSV4RRFFQ69ARIM1',
      capability: 'treasury.accounts.read',
      scope: 'own unit',
    });
    await insertGrant(env.DB, {
      id: 'tr-manage-IM1',
      roleId: '01ARZ3NDEKTSV4RRFFQ69ARIM1',
      capability: 'treasury.accounts.manage',
      scope: 'own unit',
    });
    const treasurer = await env.DB.prepare(
      "SELECT id FROM people WHERE email = 'chair.im@example.org'",
    ).first<{ id: string }>();
    await env.DB.prepare("UPDATE people SET clerk_user_id = 'clerk_app_IMT' WHERE id = ?")
      .bind(treasurer?.id ?? '')
      .run();
    await env.DB.prepare(
      "INSERT INTO privacy_notice_acknowledgements (id, person_id, notice_version_id, acknowledged_at) VALUES ('ack-IMT', ?, ?, 'now')",
    )
      .bind(treasurer?.id ?? '', NOTICE)
      .run();
    const accounts = `/api/treasury/units/${unitId}/accounts`;
    const [account] = (
      await (
        await call('clerk_app_IMT', 'GET', accounts)
      ).json<{ accounts: { id: string; hasOpeningBalance: boolean; balancePence: number }[] }>()
    ).accounts;
    expect(account).toMatchObject({ hasOpeningBalance: false, balancePence: 0 });
    const enter = () =>
      call('clerk_app_IMT', 'POST', `${accounts}/${account?.id ?? ''}/opening-balance`, {
        openingBalancePence: 12345,
        openingDate: today,
      });
    expect((await enter()).status).toBe(204);
    expect(await (await enter()).json()).toEqual({
      error: { code: 'treasury.opening-balance-entered' },
    });
  });
});
