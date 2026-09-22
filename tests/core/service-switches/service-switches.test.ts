import { env } from 'cloudflare:workers';
import { z } from 'zod';
import { beforeEach, describe, expect, it } from 'vitest';
import { isServiceEnabled, setServiceSwitch } from '../../../src/worker/core/service-switches';
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
    ).rejects.toThrow(/needs treasury/);
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
    ).rejects.toThrow(/event-organiser needs it/);
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
    ).rejects.toThrow(/not configured/);
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
});
