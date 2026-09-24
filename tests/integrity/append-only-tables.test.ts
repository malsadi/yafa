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

  it('blocks UPDATE and DELETE on privacy_notice_versions', async () => {
    await env.DB.prepare(
      'INSERT INTO privacy_notice_versions (id, text_en, text_ar, created_at) VALUES (?, ?, ?, ?)',
    )
      .bind('01ARZ3NDEKTSV4RRFFQ69PNVX', 'x', null, new Date().toISOString())
      .run();

    await expect(
      env.DB.prepare("UPDATE privacy_notice_versions SET text_en = 'tampered' WHERE id = ?")
        .bind('01ARZ3NDEKTSV4RRFFQ69PNVX')
        .run(),
    ).rejects.toThrow();

    await expect(
      env.DB.prepare('DELETE FROM privacy_notice_versions WHERE id = ?')
        .bind('01ARZ3NDEKTSV4RRFFQ69PNVX')
        .run(),
    ).rejects.toThrow();
  });

  it('blocks UPDATE and DELETE on privacy_notice_acknowledgements', async () => {
    await env.DB.prepare(
      `INSERT INTO people (id, email, clerk_user_id, name, phone, created_at) VALUES (?, ?, ?, 'Fictional Person', '07700 900000', ?)`,
    )
      .bind('01ARZ3NDEKTSV4RRFFQ69PNAP', 'x@example.org', null, new Date().toISOString())
      .run();
    await env.DB.prepare(
      'INSERT INTO privacy_notice_versions (id, text_en, text_ar, created_at) VALUES (?, ?, ?, ?)',
    )
      .bind('01ARZ3NDEKTSV4RRFFQ69PNAV', 'x', null, new Date().toISOString())
      .run();
    await env.DB.prepare(
      `INSERT INTO privacy_notice_acknowledgements
         (id, person_id, notice_version_id, acknowledged_at)
       VALUES (?, ?, ?, ?)`,
    )
      .bind(
        '01ARZ3NDEKTSV4RRFFQ69PNAA',
        '01ARZ3NDEKTSV4RRFFQ69PNAP',
        '01ARZ3NDEKTSV4RRFFQ69PNAV',
        new Date().toISOString(),
      )
      .run();

    await expect(
      env.DB.prepare(
        "UPDATE privacy_notice_acknowledgements SET acknowledged_at = 'tampered' WHERE id = ?",
      )
        .bind('01ARZ3NDEKTSV4RRFFQ69PNAA')
        .run(),
    ).rejects.toThrow();

    await expect(
      env.DB.prepare('DELETE FROM privacy_notice_acknowledgements WHERE id = ?')
        .bind('01ARZ3NDEKTSV4RRFFQ69PNAA')
        .run(),
    ).rejects.toThrow();
  });
});
