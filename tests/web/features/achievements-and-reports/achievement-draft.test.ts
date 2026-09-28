import { describe, expect, it } from 'vitest';
import type { AchievementRecord } from '../../../../src/shared/achievements-and-reports/achievement-records';
import {
  draftOf,
  toggled,
} from '../../../../src/web/features/achievements-and-reports/achievement-draft';

describe('an achievement on screen (brief 24 A1; O-151)', () => {
  it('starts a change from the achievement as recorded, officers included', () => {
    const a = {
      title: 'Award',
      date: '2026-01-02',
      categoryItemId: 'c1',
      description: 'Text',
      officers: [{ personId: 'p1', name: 'A' }],
    } as AchievementRecord;
    expect(draftOf(a)).toEqual({
      title: 'Award',
      date: '2026-01-02',
      categoryItemId: 'c1',
      description: 'Text',
      officerPersonIds: ['p1'],
    });
  });

  it('ticks and unticks officers, each once', () => {
    expect(toggled(['p1'], 'p1', true)).toEqual(['p1']);
    expect(toggled(['p1'], 'p2', true)).toEqual(['p1', 'p2']);
    expect(toggled(['p1', 'p2'], 'p1', false)).toEqual(['p2']);
  });
});
