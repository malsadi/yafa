import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { getSetting, registerSetting } from '../../../../src/worker/core/settings';
import {
  getServiceSettingHistory,
  removeServiceSettingOverride,
  restoreServiceSetting,
  setServiceSetting,
} from '../../../../src/worker/services/administration-panel/service-settings/service-setting-changes.service';
import { insertSystemAdministrator } from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const PATH = `${ORIGIN}/api/administration-panel/service-settings`;
const LANGUAGE = 'administration-panel.new_officer_language';
const NOTICE = '01ARZ3NDEKTSV4RRFFQ69SSNV';

let admin: { clerkUserId: string; personId: string; unitId: string };
let officer: { clerkUserId: string; personId: string };

async function call(clerkUserId: string, method: string, path = PATH, body?: unknown) {
  const { app, tokenFor } = await buildTestApp();
  return app.request(path, {
    method,
    headers: {
      Authorization: `Bearer ${await tokenFor(clerkUserId, { secondFactor: true })}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

interface View {
  settings: { key: string; national: unknown; input: { kind: string } }[];
  roles: unknown[];
}
const national = async (key: string) =>
  (await (await call(admin.clerkUserId, 'GET')).json<View>()).settings.find((s) => s.key === key)
    ?.national;

// Tests build on each other in order within this file's shared storage.
describe('service settings (brief 25 C1, 8.1)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await seedOfficer({ suffix: 'SS1', unitType: 'national' });
    await insertSystemAdministrator(env.DB, admin.personId);
    officer = await seedOfficer({ suffix: 'SS2' });
    for (const person of [admin, officer]) await acknowledgeNotice(person.personId, NOTICE);
  });

  it('lists every registered setting, none configured, with how each is entered', async () => {
    const view = await (await call(admin.clerkUserId, 'GET')).json<View>();

    expect(view.settings.map((s) => s.key)).toContain(LANGUAGE);
    expect(view.settings.every((s) => s.national === null)).toBe(true);
    expect(
      view.settings.find((s) => s.key === 'committee-register.roles_requiring_mfa')?.input,
    ).toEqual({
      kind: 'roles',
    });
    expect((await call(officer.clerkUserId, 'GET')).status).toBe(403);
  });

  it('sets a national value, checked against the setting, and refuses unknown settings and overrides', async () => {
    const put = (key: string, body: object) =>
      call(admin.clerkUserId, 'PUT', `${PATH}/${key}`, body);

    expect((await put(LANGUAGE, { value: 'fr' })).status).toBe(400);
    expect(await (await put('nothing.here', { value: 1 })).json()).toEqual({
      error: { code: 'service-settings.not-registered' },
    });
    expect(await (await put(LANGUAGE, { value: 'en', unitId: admin.unitId })).json()).toEqual({
      error: { code: 'service-settings.no-unit-override' },
    });
    expect((await put(LANGUAGE, { value: 'en' })).status).toBe(204);
    expect((await put(LANGUAGE, { value: 'ar' })).status).toBe(204);
    expect(await national(LANGUAGE)).toBe('ar');
  });

  it('keeps every change with who and when, and restores an earlier value (brief 8.1)', async () => {
    const history = await (
      await call(admin.clerkUserId, 'GET', `${PATH}/${LANGUAGE}/history`)
    ).json<{ id: string; newValue: unknown; changedByName: string }[]>();
    const first = history.find((h) => h.newValue === 'en');

    expect(history.map((h) => h.newValue)).toEqual(['ar', 'en']);
    expect(first?.changedByName).toBeTruthy();
    expect(
      (
        await call(
          admin.clerkUserId,
          'POST',
          `${PATH}/${LANGUAGE}/history/${first?.id ?? ''}/restore`,
        )
      ).status,
    ).toBe(204);
    expect(await national(LANGUAGE)).toBe('en');
  });

  it('sets, removes and restores a unit override where the setting allows one', async () => {
    registerSetting({
      key: 'committee-register.fixture_override',
      label: 'Fixture',
      description: 'A setting a unit may override, for this test only.',
      schema: z.number().int(),
      required: false,
      unitOverrideAllowed: true,
    });
    const ctx = {
      personId: admin.personId,
      units: [],
      roles: [],
      capabilities: [],
      isSystemAdmin: true,
    };
    const key = 'committee-register.fixture_override';
    const read = async () => {
      const setting = await getSetting<number>(env.DB, key, admin.unitId);
      return setting.status === 'configured' ? setting.value : null;
    };

    await setServiceSetting(env.DB, ctx, { key, value: 5 });
    await setServiceSetting(env.DB, ctx, { key, value: 9, unitId: admin.unitId });
    expect(await read()).toBe(9);
    await removeServiceSettingOverride(env.DB, ctx, { key, unitId: admin.unitId });
    expect(await read()).toBe(5);
    const history = await getServiceSettingHistory(env.DB, ctx, key);
    expect(history[0]).toMatchObject({ scope: admin.unitId, previousValue: 9, newValue: null });
    await restoreServiceSetting(env.DB, ctx, { key, historyId: history[1]?.id ?? '' });
    expect(await read()).toBe(9);
  });
});
