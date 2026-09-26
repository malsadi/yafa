import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { listRegisteredRoutes } from '../../../../src/worker/core/permissions';
import { setSetting } from '../../../../src/worker/core/settings';
import { insertSystemAdministrator } from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69BFNV';
// Fictional R2 credentials: signing a link needs no network.
const R2 = { R2_ACCOUNT_ID: 'fictional', R2_ACCESS_KEY_ID: 'id', R2_SECRET_ACCESS_KEY: 'secret' };

let admin: { clerkUserId: string; personId: string; unitId: string };

async function call(method: string, path: string, body?: unknown, signedIn = true) {
  const { app, tokenFor } = await buildTestApp(R2);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (signedIn)
    headers.Authorization = `Bearer ${await tokenFor(admin.clerkUserId, { secondFactor: true })}`;
  return app.request(`${ORIGIN}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** A PNG header of a given width and height: the part the icon check reads. */
function pngHeader(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

async function uploaded(
  slot: string,
  fileName: string,
  body: Uint8Array | string,
  contentType: string,
) {
  const start = await (
    await call('POST', `/api/administration-panel/branding/files/${slot}/uploads`, {
      fileName,
      size: typeof body === 'string' ? body.length : body.byteLength,
      contentType,
    })
  ).json<{ fileId: string; url: string }>();
  // The browser's upload straight to R2, stood in for by the test bucket.
  await env.FILES.put(
    `app-branch-BF1/administration-panel/branding/${start.fileId}-${fileName}`,
    body,
    {
      httpMetadata: { contentType },
    },
  );
  return call('PUT', `/api/administration-panel/branding/files/${slot}`, {
    fileId: start.fileId,
    fileName,
  });
}

// Tests build on each other in order within this file's shared storage.
describe('branding files, and the only public files (brief 25 C3, 9.3; D-084, D-088)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await seedOfficer({ suffix: 'BF1', unitType: 'national' });
    await insertSystemAdministrator(env.DB, admin.personId);
    await acknowledgeNotice(admin.personId, NOTICE);
    await buildTestApp();
    for (const [key, value] of [
      ['administration-panel.file_types_branding_images', ['image/png']],
      ['administration-panel.file_size_limit_branding_images_mb', 5],
      ['administration-panel.file_types_fonts', ['font/woff2']],
      ['administration-panel.file_size_limit_fonts_mb', 5],
    ] as const) {
      await setSetting(env.DB, { key, value, actorPersonId: admin.personId });
    }
  });

  it('serves no install file or icon until branding is set', async () => {
    expect((await call('GET', '/manifest.webmanifest', undefined, false)).status).toBe(404);
    expect((await call('GET', '/branding/icon-192.png', undefined, false)).status).toBe(404);
  });

  it('takes an icon only as a square PNG of its exact size, and serves it without a sign-in', async () => {
    const wrong = await uploaded('icon-192', 'icon.png', pngHeader(192, 180), 'image/png');
    expect(await wrong.json()).toEqual({ error: { code: 'branding.icon-not-square' } });

    expect((await uploaded('icon-192', 'icon.png', pngHeader(192, 192), 'image/png')).status).toBe(
      200,
    );
    const served = await call('GET', '/branding/icon-192.png', undefined, false);
    expect(served.status).toBe(200);
    expect(new Uint8Array(await served.arrayBuffer())).toEqual(pngHeader(192, 192));
  });

  it('serves a font, and builds the install file from the name and colours', async () => {
    await uploaded('latin-font', 'latin.woff2', 'wOF2', 'font/woff2');
    await setSetting(env.DB, {
      key: 'administration-panel.organisation_name',
      value: { en: 'Example Council', ar: null },
      actorPersonId: admin.personId,
    });
    const installFile = await (
      await call('GET', '/manifest.webmanifest', undefined, false)
    ).json<{
      name: string;
      icons: { src: string }[];
    }>();

    expect(await (await call('GET', '/branding/fonts/latin', undefined, false)).text()).toBe(
      'wOF2',
    );
    expect(installFile.name).toBe('Example Council');
    expect(installFile.icons.map((i) => i.src)).toEqual([
      '/branding/icon-192.png',
      '/branding/icon-512.png',
    ]);
  });

  it('declares exactly these five public routes, none taking a path from the request (D-088)', async () => {
    await buildTestApp();
    const publicRoutes = listRegisteredRoutes().filter((r) => r.access.kind.startsWith('public-'));

    expect(publicRoutes.map((r) => r.path)).toEqual([
      '/manifest.webmanifest',
      '/branding/icon-192.png',
      '/branding/icon-512.png',
      '/branding/fonts/latin',
      '/branding/fonts/arabic',
    ]);
    expect(publicRoutes.every((r) => !r.path.includes(':') && !r.path.includes('*'))).toBe(true);
  });

  it('reaches no other file without a sign-in, whatever path is asked for (D-088)', async () => {
    await env.FILES.put('app-branch-BF1/administration-panel/branding/secret.png', 'not public');
    for (const path of [
      '/branding/secret.png',
      '/branding/fonts/other',
      '/branding/icon-192.png/../secret.png',
      '/branding/app-branch-BF1/administration-panel/branding/secret.png',
    ]) {
      const res = await call('GET', path, undefined, false);
      expect(await res.text(), path).not.toContain('not public');
    }
  });
});
