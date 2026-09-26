import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { removeOrphanFiles } from '../../../src/worker/core/files';
import { resetSettingsRegistryForTests, setSetting } from '../../../src/worker/core/settings';
import { registerAdministrationPanelSettings } from '../../../src/worker/services/administration-panel/settings';

const LATER = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

describe('the orphan clean-up (brief 9.3, 11)', () => {
  beforeAll(async () => {
    resetSettingsRegistryForTests();
    registerAdministrationPanelSettings();
    await env.FILES.put('GC/x/r/recorded.png', 'a');
    await env.FILES.put('GC/x/r/orphan.png', 'b');
    await env.DB.prepare(
      `INSERT INTO files (id, key, unit_id, service, record_id, use, file_name, uploaded_by, size, content_type, checksum, locked, created_at)
       VALUES ('f-rec', 'GC/x/r/recorded.png', 'u', 'x', 'r', 'documents', 'recorded.png', 'p', 1, 'image/png', 'c', 0, 'now')`,
    ).run();
  });

  it('removes nothing while the orphan age is not set (rule 5)', async () => {
    expect(await removeOrphanFiles(env.DB, env.FILES, LATER)).toBe(0);
    expect(await env.FILES.head('GC/x/r/orphan.png')).not.toBeNull();
  });

  it('keeps recent objects, and removes only old ones with no record', async () => {
    await setSetting(env.DB, {
      key: 'administration-panel.orphan_file_age_days',
      value: 2,
      actorPersonId: 'p',
    });

    expect(await removeOrphanFiles(env.DB, env.FILES)).toBe(0);
    expect(await removeOrphanFiles(env.DB, env.FILES, LATER)).toBe(1);
    expect(await env.FILES.head('GC/x/r/orphan.png')).toBeNull();
    expect(await env.FILES.head('GC/x/r/recorded.png')).not.toBeNull();
  });
});
