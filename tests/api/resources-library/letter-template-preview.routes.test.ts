import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { setSetting } from '../../../src/worker/core/settings';
import { buildTestApp, insertNoticeVersion, ORIGIN } from '../../app/app-fixtures';
import { libraryOfficer, type Officer } from './library-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69LVNV';
const BODY = {
  template: { subject: null, body: 'Dear {{contact}},', language: 'en' },
  logoPlaceholder: 'Logo',
  signer: { name: 'The signing officer', role: 'Their role' },
};
let author: Officer;
let reader: Officer;

async function preview(officer: Officer) {
  // No Browser Rendering binding here, as in local development.
  const { app, tokenFor } = await buildTestApp({ BROWSER: undefined });
  return app.request(
    `${ORIGIN}/api/resources-library/units/${officer.unitId}/letter-templates/preview`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await tokenFor(officer.clerkUserId)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(BODY),
    },
  );
}

describe('a letter template as a PDF on the letterhead (D-111)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    const read = 'resources-library.library.read';
    author = await libraryOfficer({
      suffix: 'LV1',
      notice: NOTICE,
      capabilities: [read, 'resources-library.letter-templates.manage'],
    });
    reader = await libraryOfficer({ suffix: 'LV2', notice: NOTICE, capabilities: [read] });
  });

  it('is for those who write the unit’s letter templates', async () => {
    expect((await preview(reader)).status).toBe(403);
  });

  it('waits for the branding it needs, then for Browser Rendering', async () => {
    const waiting = await preview(author);
    expect(waiting.status).toBe(409);
    expect(await waiting.json()).toMatchObject({ error: { code: 'setting.not-configured' } });

    await buildTestApp();
    for (const [key, value] of [
      ['administration-panel.organisation_name', { en: 'Example Council', ar: null }],
      ['administration-panel.main_colour', '#1D4ED8'],
      ['administration-panel.accent_colour', '#B91C1C'],
      ['administration-panel.logo_position', 'left'],
    ] as const) {
      await setSetting(env.DB, { key, value, actorPersonId: author.personId });
    }
    const unbound = await preview(author);
    expect(unbound.status).toBe(503);
    expect(await unbound.json()).toMatchObject({ error: { code: 'pdf.not-available' } });
  });
});
