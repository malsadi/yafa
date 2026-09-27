import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildCalendarEntryStatement, checkClashes } from '../../../src/worker/services/calendar';
import { insertUnitForFiling } from '../filed-file';

const UNIT = 'u-calendar-multi-day';

describe('an event over several days in the Calendar (D-189)', () => {
  beforeAll(async () => {
    await insertUnitForFiling(env.DB, UNIT);
    await env.DB.batch([
      buildCalendarEntryStatement(env.DB, {
        unitId: UNIT,
        kind: 'event',
        sourceRecordId: 'camp',
        title: 'Youth camp',
        titleAr: null,
        date: '2099-07-10',
        lastDate: '2099-07-12',
        startTime: null,
      }),
    ]);
  });

  it('clashes on every day it covers, naming the first chosen day it falls on', async () => {
    expect(await checkClashes(env.DB, UNIT, '2099-07-11')).toEqual([
      { kind: 'event', title: 'Youth camp', titleAr: null, date: '2099-07-11', startTime: null },
    ]);
    expect(await checkClashes(env.DB, UNIT, '2099-07-05', { lastDate: '2099-07-10' })).toEqual([
      { kind: 'event', title: 'Youth camp', titleAr: null, date: '2099-07-10', startTime: null },
    ]);
    expect(await checkClashes(env.DB, UNIT, '2099-07-13')).toEqual([]);
  });

  it('refuses a last day that is not after the first', async () => {
    await expect(
      env.DB.batch([
        buildCalendarEntryStatement(env.DB, {
          unitId: UNIT,
          kind: 'event',
          sourceRecordId: 'bad',
          title: 'Bad',
          titleAr: null,
          date: '2099-07-10',
          lastDate: '2099-07-10',
          startTime: null,
        }),
      ]),
    ).rejects.toThrow();
  });
});
