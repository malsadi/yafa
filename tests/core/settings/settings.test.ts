import { env } from 'cloudflare:workers';
import { z } from 'zod';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  getSetting,
  registerSetting,
  resetSettingsRegistryForTests,
  setSetting,
} from '../../../src/worker/core/settings';

const ACTOR = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const BRANCH_UNIT_ID = '01ARZ3NDEKTSV4RRFFQ69G5FAW';

describe('settings registry', () => {
  beforeEach(() => {
    resetSettingsRegistryForTests();
  });

  it('rejects a key that is not <service>.<setting_name>', () => {
    expect(() => {
      registerSetting({
        key: 'NotAKey',
        label: 'x',
        description: 'x',
        schema: z.string(),
        required: false,
        unitOverrideAllowed: false,
      });
    }).toThrow();
  });

  it('rejects registering the same key twice', () => {
    const definition = {
      key: 'treasury.approval_threshold',
      label: 'Approval threshold',
      description: 'x',
      schema: z.number(),
      required: true,
      unitOverrideAllowed: true,
    };
    registerSetting(definition);
    expect(() => {
      registerSetting(definition);
    }).toThrow();
  });
});

describe('getSetting / setSetting', () => {
  beforeEach(() => {
    resetSettingsRegistryForTests();
    registerSetting({
      key: 'treasury.approval_threshold',
      label: 'Approval threshold',
      description: 'Debits above this need a second approval',
      schema: z.number().int().positive(),
      required: true,
      unitOverrideAllowed: true,
    });
    registerSetting({
      key: 'administration-panel.new_officer_language',
      label: 'New officer language',
      description: 'x',
      schema: z.enum(['en', 'ar']),
      required: true,
      unitOverrideAllowed: false,
    });
    // Dedicated keys for the two tests below: settings_history and
    // audit_log are append-only (a trigger blocks DELETE), so nothing
    // clears them between tests in this file — each test that inspects
    // those tables directly needs a key nothing else in this file touches.
    registerSetting({
      key: 'treasury.history_probe',
      label: 'x',
      description: 'x',
      schema: z.number(),
      required: false,
      unitOverrideAllowed: false,
    });
    registerSetting({
      key: 'treasury.audit_probe',
      label: 'x',
      description: 'x',
      schema: z.number(),
      required: false,
      unitOverrideAllowed: false,
    });
  });

  it('reports not-configured when nothing has been set', async () => {
    const result = await getSetting(env.DB, 'treasury.approval_threshold');
    expect(result).toEqual({ status: 'not-configured' });
  });

  it('stores and resolves a national value', async () => {
    await setSetting(env.DB, {
      key: 'treasury.approval_threshold',
      value: 5000,
      actorPersonId: ACTOR,
    });

    const result = await getSetting<number>(env.DB, 'treasury.approval_threshold');
    expect(result).toEqual({ status: 'configured', value: 5000 });
  });

  it('rejects a value that fails the setting schema', async () => {
    await expect(
      setSetting(env.DB, { key: 'treasury.approval_threshold', value: -1, actorPersonId: ACTOR }),
    ).rejects.toThrow();
  });

  it('rejects a unit override when the setting does not allow one', async () => {
    await expect(
      setSetting(env.DB, {
        key: 'administration-panel.new_officer_language',
        value: 'en',
        unitId: BRANCH_UNIT_ID,
        actorPersonId: ACTOR,
      }),
    ).rejects.toThrow();
  });

  it('a unit override resolves ahead of the national value', async () => {
    await setSetting(env.DB, {
      key: 'treasury.approval_threshold',
      value: 5000,
      actorPersonId: ACTOR,
    });
    await setSetting(env.DB, {
      key: 'treasury.approval_threshold',
      value: 2000,
      unitId: BRANCH_UNIT_ID,
      actorPersonId: ACTOR,
    });

    const overridden = await getSetting<number>(
      env.DB,
      'treasury.approval_threshold',
      BRANCH_UNIT_ID,
    );
    expect(overridden).toEqual({ status: 'configured', value: 2000 });

    const otherUnit = await getSetting<number>(
      env.DB,
      'treasury.approval_threshold',
      'some-other-unit',
    );
    expect(otherUnit).toEqual({ status: 'configured', value: 5000 });
  });

  it('records history with a null previous value the first time, then the old value', async () => {
    await setSetting(env.DB, { key: 'treasury.history_probe', value: 5000, actorPersonId: ACTOR });
    await setSetting(env.DB, { key: 'treasury.history_probe', value: 7500, actorPersonId: ACTOR });

    const rows = await env.DB.prepare(
      'SELECT previous_value, new_value FROM settings_history WHERE key = ? ORDER BY rowid ASC',
    )
      .bind('treasury.history_probe')
      .all<{ previous_value: string | null; new_value: string }>();

    expect(rows.results).toEqual([
      { previous_value: null, new_value: '5000' },
      { previous_value: '5000', new_value: '7500' },
    ]);
  });

  it('records an audit_log entry for every change', async () => {
    await setSetting(env.DB, { key: 'treasury.audit_probe', value: 5000, actorPersonId: ACTOR });

    const row = await env.DB.prepare(
      'SELECT action, entity_type, entity_id FROM audit_log WHERE entity_id = ?',
    )
      .bind('treasury.audit_probe:__national__')
      .first<{ action: string; entity_type: string; entity_id: string }>();

    expect(row).toEqual({
      action: 'settings.set',
      entity_type: 'setting',
      entity_id: 'treasury.audit_probe:__national__',
    });
  });
});
