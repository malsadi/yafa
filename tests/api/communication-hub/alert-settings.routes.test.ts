import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { AlertChoicesView } from '../../../src/shared/communication-hub/alert-choices';
import type { PushSetup } from '../../../src/shared/communication-hub/push-setup';
import { setSetting } from '../../../src/worker/core/settings';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { call, hubOfficer, readyHub, type Officer } from './hub-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69ASNTV';
const CHOICES = '/api/communication-hub/alert-choices';
const PUSH = '/api/communication-hub/push';
let officer: Officer;

const choices = async () =>
  (await call(officer.clerkUserId, 'GET', CHOICES)).json<AlertChoicesView>();

describe("an officer's alerts and devices (brief 20 C1, C2; 15 C4; D-086, D-163)", () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    officer = await hubOfficer({ suffix: 'AS1', notice: NOTICE, capabilities: [] });
    await readyHub(officer.unitId);
  });

  it('starts with the alerts new officers start with, until the officer chooses their own (D-163)', async () => {
    expect(await choices()).toEqual({ alertTypes: null, chosen: false });
    await setSetting(env.DB, {
      key: 'communication-hub.alert_types_for_new_officers',
      value: ['notices', 'votes'],
      actorPersonId: officer.personId,
    });
    expect(await choices()).toEqual({ alertTypes: ['notices', 'votes'], chosen: false });
    expect(
      (await call(officer.clerkUserId, 'PUT', CHOICES, { alertTypes: ['replies'] })).status,
    ).toBe(204);
    expect(await choices()).toEqual({ alertTypes: ['replies'], chosen: true });
  });

  it('never lets national circulars be switched off (20 rules)', async () => {
    expect(
      (await call(officer.clerkUserId, 'PUT', CHOICES, { alertTypes: ['circulars'] })).status,
    ).toBe(400);
  });

  it("registers and removes the officer's own device, and gives the iPhone guide (D-086)", async () => {
    const setup = await (await call(officer.clerkUserId, 'GET', `${PUSH}/setup`)).json<PushSetup>();
    expect(setup).toEqual({ publicKey: null, installGuide: null });
    const device = {
      endpoint: 'https://push.example.org/AS1',
      expirationTime: null,
      keys: { p256dh: 'key', auth: 'auth' },
    };
    expect((await call(officer.clerkUserId, 'POST', `${PUSH}/subscriptions`, device)).status).toBe(
      204,
    );
    const count = async () =>
      (
        await env.DB.prepare('SELECT COUNT(*) AS n FROM push_subscriptions WHERE person_id = ?')
          .bind(officer.personId)
          .first<{ n: number }>()
      )?.n;
    expect(await count()).toBe(1);
    expect(
      (
        await call(officer.clerkUserId, 'POST', `${PUSH}/subscriptions/remove`, {
          endpoint: device.endpoint,
        })
      ).status,
    ).toBe(204);
    expect(await count()).toBe(0);
  });
});
