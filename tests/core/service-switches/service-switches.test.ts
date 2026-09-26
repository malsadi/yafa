import { env } from 'cloudflare:workers';
import { z } from 'zod';
import { beforeEach, describe, expect, it } from 'vitest';
import { isServiceEnabled, setServiceSwitch } from '../../../src/worker/core/service-switches';
import { insertUnit } from '../permissions/permission-fixtures';
import {
  registerSetting,
  resetSettingsRegistryForTests,
  setSetting,
} from '../../../src/worker/core/settings';

const ACTOR = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const BRANCH_UNIT_ID = '01ARZ3NDEKTSV4RRFFQ69G5FAW';

describe('isServiceEnabled', () => {
  it('defaults to off for an ordinary service with no switch row', async () => {
    expect(await isServiceEnabled(env.DB, 'task-tracker')).toBe(false);
  });

  it('is always on for the three services that can never be switched off', async () => {
    expect(await isServiceEnabled(env.DB, 'committee-register')).toBe(true);
    expect(await isServiceEnabled(env.DB, 'documents-archive')).toBe(true);
    expect(await isServiceEnabled(env.DB, 'administration-panel')).toBe(true);
  });
});

describe('setServiceSwitch', () => {
  beforeEach(() => {
    resetSettingsRegistryForTests();
  });

  it('refuses to switch off a service that can never be switched off', async () => {
    await expect(
      setServiceSwitch(env.DB, {
        service: 'committee-register',
        enabled: false,
        actorPersonId: ACTOR,
      }),
    ).rejects.toThrow();
  });

  it('refuses to switch on a service whose dependency is off', async () => {
    await expect(
      setServiceSwitch(env.DB, { service: 'event-organiser', enabled: true, actorPersonId: ACTOR }),
    ).rejects.toThrow('service-switches.needs-service');
  });

  it('switches on once its dependency is already on', async () => {
    await setServiceSwitch(env.DB, { service: 'treasury', enabled: true, actorPersonId: ACTOR });
    await setServiceSwitch(env.DB, {
      service: 'event-organiser',
      enabled: true,
      actorPersonId: ACTOR,
    });

    expect(await isServiceEnabled(env.DB, 'event-organiser')).toBe(true);
  });

  it('refuses to switch off a service something enabled still depends on', async () => {
    await setServiceSwitch(env.DB, { service: 'treasury', enabled: true, actorPersonId: ACTOR });
    await setServiceSwitch(env.DB, {
      service: 'event-organiser',
      enabled: true,
      actorPersonId: ACTOR,
    });

    await expect(
      setServiceSwitch(env.DB, { service: 'treasury', enabled: false, actorPersonId: ACTOR }),
    ).rejects.toThrow('service-switches.needed-by-service');
  });

  it('refuses to switch on a service with an unconfigured required setting', async () => {
    registerSetting({
      key: 'calendar.due_soon_window',
      label: 'x',
      description: 'x',
      schema: z.number(),
      required: true,
      unitOverrideAllowed: false,
    });

    await expect(
      setServiceSwitch(env.DB, { service: 'calendar', enabled: true, actorPersonId: ACTOR }),
    ).rejects.toThrow('service-switches.setup-incomplete');
  });

  it('switches on once its required setting is configured', async () => {
    registerSetting({
      key: 'calendar.window_probe',
      label: 'x',
      description: 'x',
      schema: z.number(),
      required: true,
      unitOverrideAllowed: false,
    });
    await setSetting(env.DB, { key: 'calendar.window_probe', value: 14, actorPersonId: ACTOR });

    await setServiceSwitch(env.DB, { service: 'calendar', enabled: true, actorPersonId: ACTOR });

    expect(await isServiceEnabled(env.DB, 'calendar')).toBe(true);
  });

  it('a unit override resolves ahead of the portal-wide value', async () => {
    await setServiceSwitch(env.DB, {
      service: 'task-tracker',
      enabled: true,
      actorPersonId: ACTOR,
    });
    await setServiceSwitch(env.DB, {
      service: 'task-tracker',
      enabled: false,
      unitId: BRANCH_UNIT_ID,
      actorPersonId: ACTOR,
    });

    expect(await isServiceEnabled(env.DB, 'task-tracker')).toBe(true);
    expect(await isServiceEnabled(env.DB, 'task-tracker', BRANCH_UNIT_ID)).toBe(false);
  });

  it('refuses a portal-wide switch-off that would break a unit whose own value needs it (25 C2)', async () => {
    const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
    await insertUnit(env.DB, { id: unitId, type: 'branch', code: 'switch-reach', name: 'Reach' });
    await setServiceSwitch(env.DB, { service: 'treasury', enabled: true, actorPersonId: ACTOR });
    await setServiceSwitch(env.DB, {
      service: 'event-organiser',
      enabled: true,
      unitId,
      actorPersonId: ACTOR,
    });

    await expect(
      setServiceSwitch(env.DB, { service: 'treasury', enabled: false, actorPersonId: ACTOR }),
    ).rejects.toThrow('service-switches.needed-by-service');
  });

  it('returns a unit to the portal-wide value, and never clears the portal-wide value itself', async () => {
    const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
    await setServiceSwitch(env.DB, {
      service: 'calendar',
      enabled: false,
      unitId,
      actorPersonId: ACTOR,
    });
    expect(await isServiceEnabled(env.DB, 'calendar', unitId)).toBe(false);

    await setServiceSwitch(env.DB, {
      service: 'calendar',
      enabled: null,
      unitId,
      actorPersonId: ACTOR,
    });

    expect(await isServiceEnabled(env.DB, 'calendar', unitId)).toBe(
      await isServiceEnabled(env.DB, 'calendar'),
    );
    await expect(
      setServiceSwitch(env.DB, { service: 'calendar', enabled: null, actorPersonId: ACTOR }),
    ).rejects.toThrow('service-switches.portal-wide-cannot-be-cleared');
  });

  it('refuses to switch off the three that are always on, with a code', async () => {
    await expect(
      setServiceSwitch(env.DB, {
        service: 'documents-archive',
        enabled: false,
        actorPersonId: ACTOR,
      }),
    ).rejects.toThrow('service-switches.always-on');
  });

  it('keeps the Communication hub off until the iPhone install guide is written (D-086)', async () => {
    resetSettingsRegistryForTests();
    const hub = () =>
      setServiceSwitch(env.DB, {
        service: 'communication-hub',
        enabled: true,
        actorPersonId: ACTOR,
      });

    await expect(hub()).rejects.toThrow('service-switches.setup-incomplete');
    await env.DB.prepare(
      "INSERT INTO admin_texts (key, text_en, text_ar, updated_at, updated_by) VALUES ('iphone-install-guide', 'Add it to your home screen.', NULL, 'now', ?)",
    )
      .bind(ACTOR)
      .run();
    await hub();
    expect(await isServiceEnabled(env.DB, 'communication-hub')).toBe(true);
  });
});
