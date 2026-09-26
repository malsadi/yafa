import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { insertSystemAdministrator } from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69LPNV';
const PREVIEW = '/api/administration-panel/branding/letterhead-preview';
const BODY = {
  language: 'ar',
  draft: {
    organisationName: 'Example Council',
    mainColour: '#1D4ED8',
    accentColour: '#B91C1C',
    logoPosition: 'left',
  },
  letter: {
    paragraphs: ['Body.'],
    signer: { name: 'Ada', role: 'Secretary', unit: 'General Council' },
  },
  logoPlaceholder: 'Logo',
};

let admin: { clerkUserId: string; personId: string };
let officer: { clerkUserId: string; personId: string };

async function call(who: string, body: unknown) {
  // No Browser Rendering binding here, as in local development.
  const { app, tokenFor } = await buildTestApp({ BROWSER: undefined });
  return app.request(`${ORIGIN}${PREVIEW}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await tokenFor(who, { secondFactor: true })}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('the letterhead PDF preview (brief 25 C3; D-090)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await seedOfficer({ suffix: 'LP1', unitType: 'national' });
    await insertSystemAdministrator(env.DB, admin.personId);
    officer = await seedOfficer({ suffix: 'LP2' });
    for (const person of [admin, officer]) await acknowledgeNotice(person.personId, NOTICE);
  });

  it('is for those who set the branding only', async () => {
    expect((await call(officer.clerkUserId, BODY)).status).toBe(403);
  });

  it('refuses a draft that is not a letterhead’s', async () => {
    expect(
      (await call(admin.clerkUserId, { ...BODY, draft: { ...BODY.draft, mainColour: 'red' } }))
        .status,
    ).toBe(400);
  });

  it('says so where Browser Rendering is not available, rather than failing', async () => {
    expect(await (await call(admin.clerkUserId, BODY)).json()).toEqual({
      error: { code: 'pdf.not-available' },
    });
  });
});
