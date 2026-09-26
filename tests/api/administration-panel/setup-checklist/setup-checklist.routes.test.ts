import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { describeSettingInput, listSettingDefinitions } from '../../../../src/worker/core/settings';
import { getSetupChecklist } from '../../../../src/worker/services/administration-panel/setup-checklist/setup-checklist.service';
import {
  insertRole,
  insertSystemAdministrator,
} from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69SCNV';
const PATH = `${ORIGIN}/api/administration-panel/setup-checklist`;

let admin: { clerkUserId: string; personId: string };
let officer: { clerkUserId: string; personId: string };

async function call(clerkUserId: string, method = 'GET', path = PATH, body?: unknown) {
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
const setting = (key: string, value: unknown) => ({ path: `${PATH}/settings/${key}`, value });

// A value each kind of setting accepts, for setting everything left waiting.
const BRANDING: Record<string, unknown> = {
  'administration-panel.organisation_name': { en: 'Example Council', ar: null },
  'administration-panel.main_colour': '#1D4ED8',
  'administration-panel.accent_colour': '#B91C1C',
};
function valueFor(key: string, input: { kind: string; options?: string[] }): unknown {
  if (input.kind === 'branding') return BRANDING[key];
  if (input.kind === 'multi-choice') return [input.options?.[0]];
  if (input.kind === 'choice') return input.options?.[0];
  if (input.kind === 'yes-no') return true;
  return 10;
}

// Tests build on each other in order within this file's shared storage.
describe('set-up checklist (brief 25 C6, D-024)', () => {
  beforeAll(async () => {
    admin = await seedOfficer({ suffix: 'SC1', unitType: 'national' });
    await insertSystemAdministrator(env.DB, admin.personId);
    officer = await seedOfficer({ suffix: 'SC2' });
  });

  it('puts the privacy notice first while none is set', async () => {
    await buildTestApp();
    const ctx = {
      personId: admin.personId,
      units: [],
      roles: [],
      capabilities: [],
      isSystemAdmin: true,
    };

    const items = await getSetupChecklist(env.DB, ctx);

    expect(items[0]).toEqual({ service: 'administration-panel', kind: 'privacy-notice' });
  });

  it('lists the missing designations and required settings', async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    for (const person of [admin, officer]) await acknowledgeNotice(person.personId, NOTICE);

    expect(await (await call(admin.clerkUserId)).json()).toEqual([
      {
        service: 'committee-register',
        kind: 'designation',
        designation: 'Branch register officer',
      },
      {
        service: 'committee-register',
        kind: 'designation',
        designation: 'National register officer',
      },
      // Every required setting, in the registry's order, with how it is entered.
      ...listSettingDefinitions()
        .filter((definition) => definition.required)
        .map((definition) => ({
          service: definition.key.split('.')[0],
          kind: 'setting',
          key: definition.key,
          input: describeSettingInput(definition),
        })),
      { service: 'communication-hub', kind: 'text', key: 'iphone-install-guide' },
    ]);
  });

  it('is empty once they are all set', async () => {
    await insertRole(env.DB, {
      id: 'sc-bro',
      name: 'Branch Register Officer',
      designation: 'Branch register officer',
    });
    await insertRole(env.DB, {
      id: 'sc-nro',
      name: 'National Register Officer',
      designation: 'National register officer',
    });
    const language = setting('administration-panel.new_officer_language', 'en');
    const put = (who: string, value: unknown, path = language.path) =>
      call(who, 'PUT', path, { value });

    expect((await put(officer.clerkUserId, 'en')).status).toBe(403);
    expect(await (await put(admin.clerkUserId, 'fr')).json()).toEqual({
      error: { code: 'request.invalid' },
    });
    expect(
      await (
        await put(
          admin.clerkUserId,
          true,
          setting('committee-register.branches_may_add_roles', true).path,
        )
      ).json(),
    ).toEqual({ error: { code: 'setup-checklist.not-a-required-setting' } });
    expect((await put(admin.clerkUserId, 'en')).status).toBe(204);
    expect(await (await put(admin.clerkUserId, 'ar')).json()).toEqual({
      error: { code: 'setup-checklist.already-set' },
    });
    expect(
      (
        await put(
          admin.clerkUserId,
          ['notices', 'votes'],
          setting('communication-hub.alert_types_for_new_officers', null).path,
        )
      ).status,
    ).toBe(204);
    // Every other waiting setting, with a valid value for how it is entered.
    const waiting = await (
      await call(admin.clerkUserId)
    ).json<{ kind: string; key: string; input: { kind: string; options?: string[] } }[]>();
    for (const item of waiting.filter((i) => i.kind === 'setting')) {
      const value = valueFor(item.key, item.input);
      expect(
        (await put(admin.clerkUserId, value, setting(item.key, null).path)).status,
        item.key,
      ).toBe(204);
    }
    expect(
      (
        await call(
          admin.clerkUserId,
          'PUT',
          `${ORIGIN}/api/administration-panel/notifications/install-guide`,
          {
            textEn: 'Add the portal to your home screen.',
            textAr: null,
          },
        )
      ).status,
    ).toBe(200);
    expect(await (await call(admin.clerkUserId)).json()).toEqual([]);
    // It sets every required setting through the API, one request each.
  }, 30_000);

  it('refuses an officer without the capability', async () => {
    expect((await call(officer.clerkUserId)).status).toBe(403);
  });
});
