import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { removeOldBackups, takeBackup } from '../../../../src/worker/services/administration-panel';
import { insertNoticeVersion } from '../../../app/app-fixtures';
import { call, operationsOfficer, P, set } from './operations-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69OPNTV';
let admin: Awaited<ReturnType<typeof operationsOfficer>>;
let other: Awaited<ReturnType<typeof operationsOfficer>>;

describe('maintenance mode and backups (brief 25 D3, D6; 11; D-217)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await operationsOfficer({
      suffix: 'OP1',
      notice: NOTICE,
      capabilities: [
        'administration-panel.maintenance-mode.manage',
        'administration-panel.backups.manage',
      ],
      unitType: 'national',
    });
    other = await operationsOfficer({ suffix: 'OP2', notice: NOTICE, capabilities: [] });
  });

  it('makes the portal read-only, and the switch alone still works to leave it (D6)', async () => {
    expect(
      (await call(other.clerkUserId, 'PUT', `${P}/maintenance-mode`, { enabled: true })).status,
    ).toBe(403);
    expect(
      (await call(admin.clerkUserId, 'PUT', `${P}/maintenance-mode`, { enabled: true })).status,
    ).toBe(204);
    const refused = await call(admin.clerkUserId, 'POST', `${P}/backups`);
    expect(await refused.json()).toEqual({ error: { code: 'maintenance-mode.read-only' } });
    expect(await (await call(admin.clerkUserId, 'GET', `${P}/maintenance-mode`)).json()).toEqual({
      enabled: true,
    });
    expect(
      (await call(admin.clerkUserId, 'PUT', `${P}/maintenance-mode`, { enabled: false })).status,
    ).toBe(204);
  });

  it('backs up every table: the tables, then the rows, then indexes and triggers (D3; O-161)', async () => {
    const res = await call(admin.clerkUserId, 'POST', `${P}/backups`);
    expect(res.status).toBe(201);
    const { key } = await res.json<{ key: string }>();
    const dump = (await (await env.BACKUPS.get(key))?.text()) ?? '';
    expect(dump.startsWith('PRAGMA defer_foreign_keys = on;')).toBe(true);
    const firstInsert = dump.indexOf('INSERT INTO "people"');
    expect(dump.indexOf('CREATE TABLE `people`')).toBeLessThan(firstInsert);
    expect(dump.indexOf('CREATE TRIGGER')).toBeGreaterThan(firstInsert);
    expect(dump).toContain('INSERT INTO "d1_migrations"');
    const list = await (
      await call(admin.clerkUserId, 'GET', `${P}/backups`)
    ).json<{ key: string }[]>();
    expect(list.map((b) => b.key)).toContain(key);
  });

  it('removes backups older than the retention, and none while it is unset (11)', async () => {
    await takeBackup(env.DB, env.BACKUPS);
    const later = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    expect(await removeOldBackups(env.DB, env.BACKUPS, later)).toBe(0);
    await set('administration-panel.backup_retention_days', 2, admin.personId);
    expect(await removeOldBackups(env.DB, env.BACKUPS, later)).toBeGreaterThan(0);
  });
});
