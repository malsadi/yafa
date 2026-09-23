import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import {
  buildInPortalNotificationStatement,
  countUnreadNotificationsForPerson,
  listNotificationsForPerson,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../../src/worker/core/notifications';

async function insertPerson(db: D1Database, id: string): Promise<void> {
  await db
    .prepare('INSERT INTO people (id, email, clerk_user_id, created_at) VALUES (?, ?, ?, ?)')
    .bind(id, `${id}@example.org`, null, new Date().toISOString())
    .run();
}

function insertNotificationStatement(
  db: D1Database,
  params: { id: string; personId: string; createdAt: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO notifications (id, person_id, kind, params_json, read_at, created_at)
       VALUES (?, ?, ?, ?, NULL, ?)`,
    )
    .bind(params.id, params.personId, 'test.kind', null, params.createdAt);
}

describe('buildInPortalNotificationStatement', () => {
  it('writes a row that listNotificationsForPerson then returns', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69NOTA';
    await insertPerson(env.DB, personId);

    const statement = buildInPortalNotificationStatement(env.DB, {
      personId,
      kind: 'task.reminder',
      params: { taskId: 'abc' },
    });
    await env.DB.batch([statement]);

    const rows = await listNotificationsForPerson(env.DB, personId);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.kind).toBe('task.reminder');
    expect(rows[0]?.paramsJson).toBe(JSON.stringify({ taskId: 'abc' }));
    expect(rows[0]?.readAt).toBeNull();
  });

  it('stores NULL params_json when params is omitted', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69NOTC';
    await insertPerson(env.DB, personId);

    await env.DB.batch([
      buildInPortalNotificationStatement(env.DB, { personId, kind: 'task.reminder' }),
    ]);

    const rows = await listNotificationsForPerson(env.DB, personId);
    expect(rows[0]?.paramsJson).toBeNull();
  });

  it("composes into a caller's own batch: a failing statement rolls back the notification too", async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69NOTD';
    await insertPerson(env.DB, personId);

    const collidingUnitId = 'unit-notifications-collision';
    await env.DB.prepare(
      'INSERT INTO units (id, type, code, name, created_at) VALUES (?, ?, ?, ?, ?)',
    )
      .bind(collidingUnitId, 'branch', 'notif-collision', 'x', new Date().toISOString())
      .run();

    const notificationStatement = buildInPortalNotificationStatement(env.DB, {
      personId,
      kind: 'task.reminder',
    });
    const collidingStatement = env.DB.prepare(
      'INSERT INTO units (id, type, code, name, created_at) VALUES (?, ?, ?, ?, ?)',
    ).bind(collidingUnitId, 'branch', 'notif-collision-again', 'x', new Date().toISOString());

    await expect(env.DB.batch([notificationStatement, collidingStatement])).rejects.toThrow();

    expect(await listNotificationsForPerson(env.DB, personId)).toEqual([]);
  });
});

describe('listNotificationsForPerson', () => {
  it("never returns another person's notifications, and orders newest first", async () => {
    const personA = '01ARZ3NDEKTSV4RRFFQ69NOTE';
    const personB = '01ARZ3NDEKTSV4RRFFQ69NOTF';
    await insertPerson(env.DB, personA);
    await insertPerson(env.DB, personB);

    await env.DB.batch([
      insertNotificationStatement(env.DB, {
        id: '01ARZ3NDEKTSV4RRFFQ69NF01',
        personId: personA,
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      insertNotificationStatement(env.DB, {
        id: '01ARZ3NDEKTSV4RRFFQ69NF02',
        personId: personA,
        createdAt: '2026-01-02T00:00:00.000Z',
      }),
      insertNotificationStatement(env.DB, {
        id: '01ARZ3NDEKTSV4RRFFQ69NF03',
        personId: personB,
        createdAt: '2026-01-03T00:00:00.000Z',
      }),
    ]);

    const rows = await listNotificationsForPerson(env.DB, personA);
    expect(rows.map((row) => row.id)).toEqual([
      '01ARZ3NDEKTSV4RRFFQ69NF02',
      '01ARZ3NDEKTSV4RRFFQ69NF01',
    ]);
  });
});

describe('markNotificationRead', () => {
  it("marks the caller's own notification read", async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69NOTI';
    await insertPerson(env.DB, personId);
    const notificationId = '01ARZ3NDEKTSV4RRFFQ69NG01';
    await env.DB.batch([
      insertNotificationStatement(env.DB, {
        id: notificationId,
        personId,
        createdAt: new Date().toISOString(),
      }),
    ]);

    await markNotificationRead(env.DB, { notificationId, personId });

    const rows = await listNotificationsForPerson(env.DB, personId);
    expect(rows[0]?.readAt).not.toBeNull();
  });

  it('does nothing, without throwing, when the id belongs to a different person', async () => {
    const personA = '01ARZ3NDEKTSV4RRFFQ69NOTG';
    const personB = '01ARZ3NDEKTSV4RRFFQ69NOTH';
    await insertPerson(env.DB, personA);
    await insertPerson(env.DB, personB);
    const notificationId = '01ARZ3NDEKTSV4RRFFQ69NG02';
    await env.DB.batch([
      insertNotificationStatement(env.DB, {
        id: notificationId,
        personId: personA,
        createdAt: new Date().toISOString(),
      }),
    ]);

    await expect(
      markNotificationRead(env.DB, { notificationId, personId: personB }),
    ).resolves.toBeUndefined();

    const rows = await listNotificationsForPerson(env.DB, personA);
    expect(rows[0]?.readAt).toBeNull();
  });
});

describe('countUnreadNotificationsForPerson', () => {
  it('counts only the unread rows, scoped to the caller', async () => {
    const personA = '01ARZ3NDEKTSV4RRFFQ69NOTJ';
    const personB = '01ARZ3NDEKTSV4RRFFQ69NOTK';
    await insertPerson(env.DB, personA);
    await insertPerson(env.DB, personB);
    const readId = '01ARZ3NDEKTSV4RRFFQ69NH01';
    await env.DB.batch([
      insertNotificationStatement(env.DB, {
        id: readId,
        personId: personA,
        createdAt: new Date().toISOString(),
      }),
      insertNotificationStatement(env.DB, {
        id: '01ARZ3NDEKTSV4RRFFQ69NH02',
        personId: personA,
        createdAt: new Date().toISOString(),
      }),
      insertNotificationStatement(env.DB, {
        id: '01ARZ3NDEKTSV4RRFFQ69NH03',
        personId: personB,
        createdAt: new Date().toISOString(),
      }),
    ]);
    await markNotificationRead(env.DB, { notificationId: readId, personId: personA });

    expect(await countUnreadNotificationsForPerson(env.DB, personA)).toBe(1);
  });

  it('is zero for a person with no notifications', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69NOTL';
    await insertPerson(env.DB, personId);

    expect(await countUnreadNotificationsForPerson(env.DB, personId)).toBe(0);
  });
});

describe('markAllNotificationsRead', () => {
  it("marks every one of the caller's unread notifications read, and no one else's", async () => {
    const personA = '01ARZ3NDEKTSV4RRFFQ69NOTM';
    const personB = '01ARZ3NDEKTSV4RRFFQ69NOTN';
    await insertPerson(env.DB, personA);
    await insertPerson(env.DB, personB);
    await env.DB.batch([
      insertNotificationStatement(env.DB, {
        id: '01ARZ3NDEKTSV4RRFFQ69NI01',
        personId: personA,
        createdAt: new Date().toISOString(),
      }),
      insertNotificationStatement(env.DB, {
        id: '01ARZ3NDEKTSV4RRFFQ69NI02',
        personId: personA,
        createdAt: new Date().toISOString(),
      }),
      insertNotificationStatement(env.DB, {
        id: '01ARZ3NDEKTSV4RRFFQ69NI03',
        personId: personB,
        createdAt: new Date().toISOString(),
      }),
    ]);

    await markAllNotificationsRead(env.DB, personA);

    expect(await countUnreadNotificationsForPerson(env.DB, personA)).toBe(0);
    expect(await countUnreadNotificationsForPerson(env.DB, personB)).toBe(1);
  });
});
