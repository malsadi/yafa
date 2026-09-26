import { env } from 'cloudflare:workers';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { setSetting } from '../../../src/worker/core/settings';
import { deliverPush } from '../../../src/worker/services/communication-hub';
import { buildTestApp } from '../../app/app-fixtures';
import { insertPerson } from '../../core/permissions/permission-fixtures';
import { portalPushKeys, registerDevice } from './alert-fixtures';

const PERSON = '01ARZ3NDEKTSV4RRFFQ69PSHPR';
const payload = {
  language: null,
  en: { title: 'New notice', body: 'North' },
  ar: { title: 'إعلان جديد', body: 'الشمال' },
  url: '/communication-hub/noticeboard',
};
let keys: Awaited<ReturnType<typeof portalPushKeys>>;

const pushTo = (subscriptionId: string, attempts: number, withKeys = keys) =>
  deliverPush(env.DB, withKeys, {
    subscriptionId,
    personId: PERSON,
    alertType: 'notices',
    payload,
    attempts,
  });
const answer = (status: number) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status }));
const devices = async () =>
  (
    await env.DB.prepare('SELECT id FROM push_subscriptions WHERE person_id = ?')
      .bind(PERSON)
      .all<{ id: string }>()
  ).results.map((r) => r.id);

describe('delivering a phone alert (brief 9.5; D-033, D-164)', () => {
  beforeAll(async () => {
    await buildTestApp();
    await insertPerson(env.DB, { id: PERSON, email: 'push@example.org' });
    for (const id of ['d1', 'd2', 'd3'])
      await registerDevice(id, PERSON, `https://push.example.org/${id}`);
    keys = await portalPushKeys();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('waits while the maximum attempts or the push keys are not set (rule 5)', async () => {
    const fetch = answer(201);
    expect(await pushTo('d1', 1)).toBe('retry');
    await setSetting(env.DB, {
      key: 'communication-hub.push_max_attempts',
      value: 3,
      actorPersonId: PERSON,
    });
    expect(
      await pushTo('d1', 1, { VAPID_PUBLIC_KEY: '', VAPID_PRIVATE_KEY: '', VAPID_SUBJECT: '' }),
    ).toBe('retry');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends an encrypted, signed alert to the device, and is done when it is delivered', async () => {
    const fetch = answer(201);
    expect(await pushTo('d1', 1)).toBe('done');
    const [url, init] = fetch.mock.calls[0] ?? [];
    expect(url).toBe('https://push.example.org/d1');
    expect(new Headers(init?.headers).get('authorization')).toMatch(/^vapid t=/);
    expect(new Headers(init?.headers).get('content-encoding')).toBe('aes128gcm');
  });

  it('removes a device the push service reports gone, at once (D-033)', async () => {
    answer(410);
    expect(await pushTo('d2', 1)).toBe('done');
    expect(await devices()).not.toContain('d2');
  });

  it("tries again until the administrator's maximum, by the queue's own count, then keeps it for the health screen (D-164)", async () => {
    answer(503);
    expect(await pushTo('d3', 2)).toBe('retry');
    expect(await pushTo('d3', 3)).toBe('done');
    const failures = await env.DB.prepare(
      'SELECT alert_kind AS kind, last_status AS status FROM push_delivery_failures WHERE person_id = ?',
    )
      .bind(PERSON)
      .all();
    expect(failures.results).toEqual([{ kind: 'notices', status: '503' }]);
  });
});
