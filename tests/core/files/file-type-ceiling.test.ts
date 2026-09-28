import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { USE_TYPE_CEILING } from '../../../src/shared/core/file-uses';
import { completeUpload, startUpload, type UploadTarget } from '../../../src/worker/core/files';
import { matchesFileSignature } from '../../../src/worker/core/files/file-signature';
import {
  getSetting,
  resetSettingsRegistryForTests,
  setSetting,
} from '../../../src/worker/core/settings';
import { registerAdministrationPanelSettings } from '../../../src/worker/services/administration-panel/settings';
import { fileBodyOf } from './file-bodies';

// D-218: passive types only — PDF, JPEG, PNG, DOCX, XLSX — enforced in the
// Worker, whatever an administrator sets. Never HTML, never SVG.
const ACTOR = '01ARZ3NDEKTSV4RRFFQ69FTAC';
const TYPES = 'administration-panel.file_types_documents';
const LIMIT = 'administration-panel.file_size_limit_documents_mb';
const TARGET: UploadTarget = {
  unitId: 'u-types',
  unitCode: 'GC',
  service: 'documents-archive',
  recordId: 'doc',
  use: 'documents',
};
const storage = {
  bucket: env.FILES,
  access: {
    accountId: 'fictional-account',
    jurisdiction: 'eu',
    bucket: 'yafa-portal-local-files',
    accessKeyId: 'fictional-key-id',
    secretAccessKey: 'fictional-secret',
  },
};
const set = (key: string, value: unknown) =>
  setSetting(env.DB, { key, value, actorPersonId: ACTOR });
const storeRaw = (key: string, value: unknown) =>
  env.DB.prepare(
    `INSERT INTO settings (key, scope, value, updated_at, updated_by) VALUES (?, '__national__', ?, '2026-01-01', ?)
     ON CONFLICT(key, scope) DO UPDATE SET value = excluded.value`,
  )
    .bind(key, JSON.stringify(value), ACTOR)
    .run();

describe('the passive file types ceiling (D-218)', () => {
  beforeAll(() => {
    resetSettingsRegistryForTests();
    registerAdministrationPanelSettings();
  });

  it('never lets a setting allow HTML, SVG or anything outside the use’s ceiling', async () => {
    for (const bad of ['text/html', 'image/svg+xml', 'image/webp', 'font/woff2'])
      await expect(set(TYPES, ['application/pdf', bad])).rejects.toThrow();
    await expect(
      set('administration-panel.file_types_media_images', ['video/mp4']),
    ).rejects.toThrow();
    await set(TYPES, [...USE_TYPE_CEILING.documents]);
    expect((await getSetting<string[]>(env.DB, TYPES)).status).toBe('configured');
  });

  it('refuses a barred type even when one is written straight into the database', async () => {
    await set(LIMIT, 5);
    await storeRaw(TYPES, ['text/html']);
    expect((await getSetting(env.DB, TYPES)).status).toBe('not-configured');
    const start = (contentType: string) =>
      startUpload(env.DB, storage, { ...TARGET, fileName: 'page.html', size: 10, contentType });
    await expect(start('text/html')).rejects.toThrow('files.type-not-allowed');
    await expect(start('image/svg+xml')).rejects.toThrow('files.type-not-allowed');
    await expect(start('application/pdf')).rejects.toThrow('setting.not-configured');
  });

  it('refuses and removes a file whose content is not of its declared type', async () => {
    await set(TYPES, ['application/pdf']);
    const key = 'GC/documents-archive/doc/01ARZ3NDEKTSV4RRFFQ69FTN01-fake.pdf';
    await env.FILES.put(key, '<html><script>alert(1)</script></html>', {
      httpMetadata: { contentType: 'application/pdf' },
    });
    await expect(
      completeUpload(env.FILES, env.DB, {
        ...TARGET,
        fileId: '01ARZ3NDEKTSV4RRFFQ69FTN01',
        fileName: 'fake.pdf',
        uploadedBy: ACTOR,
        locked: false,
      }),
    ).rejects.toThrow('files.type-not-allowed');
    expect(await env.FILES.head(key)).toBeNull();
  });

  it('knows each stored type by its leading bytes', () => {
    const pdf = fileBodyOf('application/pdf');
    expect(matchesFileSignature('application/pdf', pdf)).toBe(true);
    expect(matchesFileSignature('image/png', pdf)).toBe(false);
    for (const type of [
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'video/mp4',
      'font/woff2',
      'font/ttf',
      'font/otf',
    ] as const)
      expect(matchesFileSignature(type, fileBodyOf(type))).toBe(true);
    expect(matchesFileSignature('application/pdf', new Uint8Array())).toBe(false);
  });
});
