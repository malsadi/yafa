import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { InboxView } from '../../src/shared/core/inbox';
import { buildInPortalNotificationStatement } from '../../src/worker/core/notifications';
import { acknowledgeNotice, insertNoticeVersion, seedOfficer } from '../app/app-fixtures';
import { call } from '../api/documents-archive/archive-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69INBNV';
type Officer = Awaited<ReturnType<typeof seedOfficer>>;
let ada: Officer;
let ben: Officer;

const inbox = async (o: Officer) =>
  (await call(o.clerkUserId, 'GET', '/api/notifications')).json<InboxView>();

describe('the in-portal inbox (brief 9.5; D-031)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    ada = await seedOfficer({ suffix: 'IN1' });
    ben = await seedOfficer({ suffix: 'IN2' });
    for (const o of [ada, ben]) await acknowledgeNotice(o.personId, NOTICE);
    await env.DB.batch([
      buildInPortalNotificationStatement(env.DB, {
        personId: ada.personId,
        kind: 'fictional.kind',
        params: { title: 'First' },
      }),
      buildInPortalNotificationStatement(env.DB, {
        personId: ada.personId,
        kind: 'fictional.kind',
        params: { title: 'Second' },
      }),
      buildInPortalNotificationStatement(env.DB, {
        personId: ben.personId,
        kind: 'fictional.kind',
      }),
    ]);
  });

  it('shows an officer their own notifications only, with the unread count', async () => {
    const view = await inbox(ada);
    expect(view.unreadCount).toBe(2);
    expect(view.items.map((i) => i.params?.title).sort()).toEqual(['First', 'Second']);
    expect((await inbox(ben)).items).toHaveLength(1);
  });

  it("marks one read, never another officer's, and then all", async () => {
    const [first] = (await inbox(ada)).items;
    expect(
      (await call(ben.clerkUserId, 'POST', `/api/notifications/${first?.id ?? ''}/read`, {}))
        .status,
    ).toBe(204);
    expect((await inbox(ada)).unreadCount).toBe(2);
    await call(ada.clerkUserId, 'POST', `/api/notifications/${first?.id ?? ''}/read`, {});
    expect((await inbox(ada)).unreadCount).toBe(1);
    await call(ada.clerkUserId, 'POST', '/api/notifications/read-all', {});
    const after = await inbox(ada);
    expect(after.unreadCount).toBe(0);
    expect(after.items).toHaveLength(2);
    expect((await inbox(ben)).unreadCount).toBe(1);
  });
});
