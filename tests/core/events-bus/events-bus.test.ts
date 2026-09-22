import { env } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  collectEventStatements,
  registerEventHandler,
  resetEventsBusForTests,
} from '../../../src/worker/core/events-bus';

function insertUnitStatement(db: D1Database, id: string, code: string): D1PreparedStatement {
  return db
    .prepare('INSERT INTO units (id, type, code, name, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, 'branch', code, 'x', new Date().toISOString());
}

describe('events bus', () => {
  beforeEach(() => {
    resetEventsBusForTests();
  });

  it('returns no statements for an event nothing subscribes to', async () => {
    expect(await collectEventStatements(env.DB, 'nothing.subscribes', {})).toEqual([]);
  });

  it('collects and flattens statements from every handler registered for an event', async () => {
    registerEventHandler('test.thing-happened', (db, payload) => [
      insertUnitStatement(db, (payload as { unitId: string }).unitId, 'handler-one'),
    ]);
    registerEventHandler('test.thing-happened', (db, payload) => [
      insertUnitStatement(db, `${(payload as { unitId: string }).unitId}-b`, 'handler-two'),
    ]);

    const statements = await collectEventStatements(env.DB, 'test.thing-happened', {
      unitId: 'unit-events-bus-a',
    });

    expect(statements).toHaveLength(2);
  });

  it("a failing subscriber statement rolls back the publisher's own write in the same batch", async () => {
    const collidingId = 'unit-events-bus-collision';
    await insertUnitStatement(env.DB, collidingId, 'first-insert').run();

    // Registered handler's statement collides on the primary key, so it fails.
    registerEventHandler('test.publish-with-failing-subscriber', (db) => [
      insertUnitStatement(db, collidingId, 'second-insert-same-id'),
    ]);

    const publisherStatement = insertUnitStatement(
      env.DB,
      'unit-events-bus-should-not-persist',
      'publisher-write',
    );
    const subscriberStatements = await collectEventStatements(
      env.DB,
      'test.publish-with-failing-subscriber',
      {},
    );

    await expect(env.DB.batch([publisherStatement, ...subscriberStatements])).rejects.toThrow();

    const row = await env.DB.prepare('SELECT id FROM units WHERE id = ?')
      .bind('unit-events-bus-should-not-persist')
      .first();
    expect(row).toBeNull();
  });
});
