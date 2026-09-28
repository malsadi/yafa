import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { InboxView } from '../../src/shared/core/inbox';
import { buildInPortalNotificationStatement } from '../../src/worker/core/notifications';
import { setSetting } from '../../src/worker/core/settings';
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
    await setSetting(env.DB, {
      key: 'administration-panel.rows_per_page',
      value: 20,
      actorPersonId: ada.personId,
    });
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
  it('comes a page at a time, with the unread count on its own for the header (D-217)', async () => {
    await setSetting(env.DB, {
      key: 'administration-panel.rows_per_page',
      value: 1,
      actorPersonId: ada.personId,
    });
    const first = await inbox(ada);
    expect(first).toMatchObject({ page: 1, pageCount: 2 });
    expect(first.items).toHaveLength(1);
    const second = await (
      await call(ada.clerkUserId, 'GET', '/api/notifications?page=2')
    ).json<InboxView>();
    expect(second.items).toHaveLength(1);
    expect(second.items[0]?.id).not.toBe(first.items[0]?.id);
    const count = await (
      await call(ben.clerkUserId, 'GET', '/api/notifications/unread-count')
    ).json();
    expect(count).toEqual({ unreadCount: expect.any(Number) as number });
  });
});
