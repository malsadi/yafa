import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  buildCalendarEntryStatement,
  buildRemoveCalendarEntryStatement,
} from '../../../src/worker/services/calendar';
import { insertUnitForFiling } from '../filed-file';

const UNIT = 'u-calendar-read-model';
const rows = async () =>
  (
    await env.DB.prepare(
      'SELECT kind, source_record_id AS source, title, date, start_time AS time FROM calendar_entries WHERE unit_id = ?',
    )
      .bind(UNIT)
      .all()
  ).results;

describe("the Calendar's read-model of meetings and events (brief 19 build notes; 10.1)", () => {
  beforeAll(async () => {
    await insertUnitForFiling(env.DB, UNIT);
  });

  it("is written by the owning service's own batch, and brought up to date by the same record", async () => {
    const entry = {
      unitId: UNIT,
      kind: 'meeting' as const,
      sourceRecordId: 'm1',
      title: 'Committee meeting',
      date: '2026-11-02',
      startTime: '19:00',
    };
    await env.DB.batch([buildCalendarEntryStatement(env.DB, entry)]);
    await env.DB.batch([
      buildCalendarEntryStatement(env.DB, { ...entry, date: '2026-11-03', startTime: null }),
    ]);
    expect(await rows()).toEqual([
      { kind: 'meeting', source: 'm1', title: 'Committee meeting', date: '2026-11-03', time: null },
    ]);
  });

  it('is taken off by its owning service', async () => {
    await env.DB.batch([
      buildRemoveCalendarEntryStatement(env.DB, { kind: 'meeting', sourceRecordId: 'm1' }),
    ]);
    expect(await rows()).toEqual([]);
  });
});
