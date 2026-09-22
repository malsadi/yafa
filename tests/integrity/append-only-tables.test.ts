import { env } from 'cloudflare:workers';
import { z } from 'zod';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  registerSetting,
  resetSettingsRegistryForTests,
  setSetting,
} from '../../src/worker/core/settings';

const ACTOR = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

// Brief section 9.1: SQLite triggers block UPDATE and DELETE on append-only
// tables, migration 0001_immutability_triggers.sql. The application checks
// first (neither module here exposes an update/delete path at all); this
// proves the trigger itself guarantees it, independent of the application.
describe('append-only tables', () => {
  beforeEach(() => {
    resetSettingsRegistryForTests();
    registerSetting({
      key: 'treasury.integrity_probe',
      label: 'x',
      description: 'x',
      schema: z.number(),
      required: false,
      unitOverrideAllowed: false,
    });
  });

  it('blocks UPDATE and DELETE on settings_history', async () => {
    await setSetting(env.DB, { key: 'treasury.integrity_probe', value: 1, actorPersonId: ACTOR });

    await expect(
      env.DB.prepare("UPDATE settings_history SET new_value = '999' WHERE key = ?")
        .bind('treasury.integrity_probe')
        .run(),
    ).rejects.toThrow();

    await expect(
      env.DB.prepare('DELETE FROM settings_history WHERE key = ?')
        .bind('treasury.integrity_probe')
        .run(),
    ).rejects.toThrow();
  });

  it('blocks UPDATE and DELETE on audit_log', async () => {
    await setSetting(env.DB, { key: 'treasury.integrity_probe', value: 1, actorPersonId: ACTOR });

    await expect(
      env.DB.prepare("UPDATE audit_log SET action = 'tampered' WHERE actor_person_id = ?")
        .bind(ACTOR)
        .run(),
    ).rejects.toThrow();

    await expect(
      env.DB.prepare('DELETE FROM audit_log WHERE actor_person_id = ?').bind(ACTOR).run(),
    ).rejects.toThrow();
  });
});
