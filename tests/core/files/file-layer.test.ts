import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  completeUpload,
  readR2Access,
  serveFile,
  startUpload,
  type UploadTarget,
} from '../../../src/worker/core/files';
import { resetSettingsRegistryForTests, setSetting } from '../../../src/worker/core/settings';
import { registerAdministrationPanelSettings } from '../../../src/worker/services/administration-panel/settings';

const ACTOR = '01ARZ3NDEKTSV4RRFFQ69FLAC';
// Fictional credentials: signing needs no network, and nothing here reaches R2's API.
const ACCESS = {
  accountId: 'fictional-account',
  jurisdiction: 'eu',
  bucket: 'yafa-portal-local-files',
  accessKeyId: 'fictional-key-id',
  secretAccessKey: 'fictional-secret',
};
const TARGET: UploadTarget = {
  unitId: 'u-files',
  unitCode: 'GC',
  service: 'administration-panel',
  recordId: 'branding',
  use: 'branding-images',
};
const storage = { bucket: env.FILES, access: ACCESS };
const set = (key: string, value: unknown) =>
  setSetting(env.DB, { key, value, actorPersonId: ACTOR });

describe('the file layer (brief 9.3; D-087)', () => {
  beforeAll(() => {
    resetSettingsRegistryForTests();
    registerAdministrationPanelSettings();
  });

  it('waits for the use’s rules, and for the R2 credentials, before anything is stored', async () => {
    await expect(
      startUpload(env.DB, storage, {
        ...TARGET,
        fileName: 'logo.png',
        size: 10,
        contentType: 'image/png',
      }),
    ).rejects.toThrow('setting.not-configured');
    expect(() => readR2Access({ FILES_BUCKET_NAME: 'b', FILES_BUCKET_JURISDICTION: 'eu' })).toThrow(
      'files.storage-not-configured',
    );
  });

  it('refuses a type the use does not allow, and a file over its limit', async () => {
    await set('administration-panel.file_types_branding_images', ['image/png']);
    await set('administration-panel.file_size_limit_branding_images_mb', 20);
    const start = (contentType: string, size: number) =>
      startUpload(env.DB, storage, { ...TARGET, fileName: 'logo.png', size, contentType });

    await expect(start('image/jpeg', 10)).rejects.toThrow('files.type-not-allowed');
    await expect(start('image/png', 21 * 1024 * 1024)).rejects.toThrow('files.too-large');
  });

  it('gives one signed link for a small file, and one per part for a large one', async () => {
    const small = await startUpload(env.DB, storage, {
      ...TARGET,
      fileName: 'logo.png',
      size: 10,
      contentType: 'image/png',
    });
    const large = await startUpload(env.DB, storage, {
      ...TARGET,
      fileName: 'big.png',
      size: 15 * 1024 * 1024,
      contentType: 'image/png',
    });

    expect(small.kind).toBe('single');
    expect(small.kind === 'single' && new URL(small.url).host).toBe(
      'fictional-account.eu.r2.cloudflarestorage.com',
    );
    expect(small.kind === 'single' && small.url).toContain('X-Amz-Signature=');
    expect(large.kind === 'multipart' && large.partUrls).toHaveLength(2);
    expect(large.kind === 'multipart' && large.partUrls[1]).toContain('partNumber=2');
  });

  it('records a file only once it is in R2 with a type and size its use allows', async () => {
    const done = (fileId: string, fileName: string) =>
      completeUpload(env.FILES, env.DB, {
        ...TARGET,
        fileId,
        fileName,
        uploadedBy: ACTOR,
        locked: false,
      });
    await expect(done('01ARZ3NDEKTSV4RRFFQ69FLN01', 'missing.png')).rejects.toThrow(
      'files.not-uploaded',
    );

    await env.FILES.put(
      'GC/administration-panel/branding/01ARZ3NDEKTSV4RRFFQ69FLN02-wrong.jpg',
      'x',
      {
        httpMetadata: { contentType: 'image/jpeg' },
      },
    );
    await expect(done('01ARZ3NDEKTSV4RRFFQ69FLN02', 'wrong.jpg')).rejects.toThrow(
      'files.type-not-allowed',
    );
    expect(
      await env.FILES.head('GC/administration-panel/branding/01ARZ3NDEKTSV4RRFFQ69FLN02-wrong.jpg'),
    ).toBeNull();

    await env.FILES.put(
      'GC/administration-panel/branding/01ARZ3NDEKTSV4RRFFQ69FLN03-logo.png',
      'png-bytes',
      {
        httpMetadata: { contentType: 'image/png' },
      },
    );
    const { file, statement } = await done('01ARZ3NDEKTSV4RRFFQ69FLN03', 'logo.png');
    await statement.run();
    expect(file).toMatchObject({ size: 9, contentType: 'image/png', use: 'branding-images' });
    expect(file.checksum).toMatch(/^[0-9a-f]{32}$/);
  });

  it('streams a small file, and sends a short-lived link for a large one', async () => {
    await set('administration-panel.download_link_threshold_mb', 1);
    await set('administration-panel.download_link_lifetime_minutes', 5);
    const file = {
      id: 'f',
      key: 'GC/administration-panel/branding/01ARZ3NDEKTSV4RRFFQ69FLN03-logo.png',
      unitId: 'u',
      service: 'administration-panel',
      recordId: 'branding',
      use: 'branding-images' as const,
      fileName: 'logo.png',
      uploadedBy: ACTOR,
      size: 9,
      contentType: 'image/png',
      checksum: 'c',
      locked: false,
      createdAt: 'now',
    };
    const small = await serveFile(env.DB, { bucket: env.FILES, access: () => ACCESS }, file);
    const large = await serveFile(
      env.DB,
      { bucket: env.FILES, access: () => ACCESS },
      { ...file, size: 2 * 1024 * 1024 },
    );

    expect(await small.text()).toBe('png-bytes');
    expect(large.status).toBe(302);
    expect(large.headers.get('Location')).toContain('X-Amz-Expires=300');
  });

  it('never changes or deletes a locked file’s record (brief 9.3)', async () => {
    await env.DB.prepare(
      "UPDATE files SET locked = 1 WHERE id = '01ARZ3NDEKTSV4RRFFQ69FLN03'",
    ).run();

    await expect(
      env.DB.prepare(
        "UPDATE files SET file_name = 'x' WHERE id = '01ARZ3NDEKTSV4RRFFQ69FLN03'",
      ).run(),
    ).rejects.toThrow(/locked/);
    await expect(
      env.DB.prepare("DELETE FROM files WHERE id = '01ARZ3NDEKTSV4RRFFQ69FLN03'").run(),
    ).rejects.toThrow(/locked/);
  });
});
