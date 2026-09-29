import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { listRegisteredRoutes } from '../../../../src/worker/core/permissions';
import { setSetting } from '../../../../src/worker/core/settings';
import { buildTestApp, ORIGIN, seedOfficer } from '../../../app/app-fixtures';

let admin: { personId: string };

async function publicGet(path: string) {
  const { app } = await buildTestApp();
  return app.request(`${ORIGIN}${path}`);
}

// Tests build on each other in order within this file's shared storage.
describe('the install file, and the only public route (D-036, D-088, D-223)', () => {
  beforeAll(async () => {
    admin = await seedOfficer({ suffix: 'PB1', unitType: 'national' });
    await buildTestApp();
  });

  it('serves no install file until the organisation name is set', async () => {
    expect((await publicGet('/manifest.webmanifest')).status).toBe(404);
  });

  it('builds the install file from the name, with the fixed square logos as its icons', async () => {
    await setSetting(env.DB, {
      key: 'administration-panel.organisation_name',
      value: { en: 'Example Council', ar: null },
      actorPersonId: admin.personId,
    });
    const installFile = await (
      await publicGet('/manifest.webmanifest')
    ).json<{
      name: string;
      icons: { src: string; sizes: string }[];
    }>();

    expect(installFile.name).toBe('Example Council');
    expect(installFile.icons).toEqual([
      { src: '/branding/logo-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/branding/logo-512.png', sizes: '512x512', type: 'image/png' },
    ]);
  });

  it('declares the install file as the only public route, taking no path from the request', async () => {
    await buildTestApp();
    const publicRoutes = listRegisteredRoutes().filter((r) => r.access.kind.startsWith('public-'));

    expect(publicRoutes.map((r) => r.path)).toEqual(['/manifest.webmanifest']);
  });

  it('reaches no stored file without a sign-in, whatever path is asked for (D-088)', async () => {
    await env.FILES.put('app-branch-PB1/administration-panel/branding/secret.png', 'not public');
    for (const path of [
      '/branding/secret.png',
      '/branding/logo.png/../secret.png',
      '/branding/app-branch-PB1/administration-panel/branding/secret.png',
    ]) {
      const res = await publicGet(path);
      expect(await res.text(), path).not.toContain('not public');
    }
  });
});
