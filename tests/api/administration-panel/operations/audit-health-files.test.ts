import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { AuditEntry } from '../../../../src/shared/administration-panel/audit-entry';
import type { FileHousekeeping } from '../../../../src/shared/administration-panel/file-housekeeping';
import type { SystemHealth } from '../../../../src/shared/administration-panel/system-health';
import type { Page } from '../../../../src/shared/core/page';
import { buildAuditStatement } from '../../../../src/worker/core/audit';
import { insertNoticeVersion } from '../../../app/app-fixtures';
import { call, operationsOfficer, P, set } from './operations-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69OQNTV';
let admin: Awaited<ReturnType<typeof operationsOfficer>>;

const audit = (action: string, entityType: string, after: object) =>
  buildAuditStatement(env.DB, {
    actorPersonId: admin.personId,
    action,
    entityType,
    entityId: 'x1',
    before: { old: 'value' },
    after,
  }).run();

describe('the audit log, system health and file housekeeping (brief 25 D1, D2, D5; D-217)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await operationsOfficer({
      suffix: 'OQ1',
      notice: NOTICE,
      capabilities: [
        'administration-panel.audit-log.read',
        'administration-panel.system-health.manage',
        'administration-panel.file-housekeeping.read',
      ],
      unitType: 'national',
    });
    await audit('letter-out.generated', 'letter-out', { subject: 'Private letter subject' });
    await audit('settings.set', 'setting', { value: 42 });
  });

  it('waits for "Rows per page", then pages, filters by service, and hides content values (D2; O-167, O-169)', async () => {
    const search = (query: string) => call(admin.clerkUserId, 'GET', `${P}/audit-log?${query}`);
    expect(await (await search('')).json()).toEqual({ error: { code: 'setting.not-configured' } });
    await set('administration-panel.rows_per_page', 1, admin.personId);
    const letters = await (
      await search('service=correspondence-and-letters')
    ).json<Page<AuditEntry>>();
    expect(letters.items).toEqual([
      expect.objectContaining({
        action: 'letter-out.generated',
        service: 'correspondence-and-letters',
        before: null,
        after: null,
      }),
    ]);
    const settings = await (
      await search('service=administration-panel&entityType=setting&entityId=x1')
    ).json<Page<AuditEntry>>();
    expect(settings.items[0]).toMatchObject({ action: 'settings.set', after: '{"value":42}' });
    const all = await (await search('')).json<Page<AuditEntry>>();
    expect(all.items).toHaveLength(1);
    expect(all.pageCount).toBeGreaterThan(1);
  });

  it('exports the same as CSV, without content values', async () => {
    const csv = await (
      await call(admin.clerkUserId, 'GET', `${P}/audit-log.csv?service=correspondence-and-letters`)
    ).text();
    expect(csv.split('\r\n')[0]).toBe(
      'occurredAt,actorName,action,service,entityType,entityId,before,after',
    );
    expect(csv).toContain('letter-out.generated');
    expect(csv).not.toContain('Private letter subject');
  });

  it('shows every scheduled job, runs one again and records it, and refuses an unknown one (D1)', async () => {
    const health = await (
      await call(admin.clerkUserId, 'GET', `${P}/system-health`)
    ).json<SystemHealth>();
    expect(health.jobs.map((j) => j.jobName)).toContain('backup');
    expect(
      (await call(admin.clerkUserId, 'POST', `${P}/system-health/jobs/push-pruning/run`)).status,
    ).toBe(204);
    const after = await (
      await call(admin.clerkUserId, 'GET', `${P}/system-health`)
    ).json<SystemHealth>();
    expect(after.jobs.find((j) => j.jobName === 'push-pruning')?.lastRunAt).not.toBeNull();
    expect((await call(admin.clerkUserId, 'POST', `${P}/system-health/jobs/nope/run`)).status).toBe(
      404,
    );
  });

  it('reports objects kept with no record, and storage per unit (D5)', async () => {
    await env.FILES.put('app-branch-OQ1/orphan/never-completed.pdf', 'pdf');
    const report = await (
      await call(admin.clerkUserId, 'GET', `${P}/file-housekeeping`)
    ).json<FileHousekeeping>();
    expect(report.orphans.latest.map((o) => o.key)).toContain(
      'app-branch-OQ1/orphan/never-completed.pdf',
    );
    expect(report.storage.some((s) => s.unitId === admin.unitId)).toBe(true);
  });
});
