import { describe, expect, it } from 'vitest';
import type {
  AgendaItemRecord,
  MeetingSummary,
} from '../../../../src/shared/meeting-recorder/meeting-records';
import { autosaveDue } from '../../../../src/web/features/meeting-recorder/autosave-due';
import {
  changeRequest,
  meetingDraftOf,
  scheduleRequest,
} from '../../../../src/web/features/meeting-recorder/meeting-draft';
import {
  outcomeBodyOf,
  outcomeDraftOf,
} from '../../../../src/web/features/meeting-recorder/outcome-draft';

const MEETING = {
  id: 'm1',
  unitId: 'u1',
  typeItemId: 't1',
  date: '2099-03-10',
  startTime: '19:00',
  place: 'Hall',
  onlineLink: null,
  chairPersonId: 'p1',
  secretaryPersonId: 'p2',
  version: 3,
} as MeetingSummary;

const ITEM = {
  id: 'i1',
  outcomeKind: null,
  votesFor: null,
  votesAgainst: null,
  votesAbstain: null,
  voteResult: null,
  decision: null,
  version: 2,
} as AgendaItemRecord;

describe('the Meeting recorder screens (brief 22; D-198, D-206, D-207)', () => {
  it('schedules a meeting with its attendees, and changes one from the version read', () => {
    const draft = meetingDraftOf(MEETING);
    expect(scheduleRequest('u1', draft, ['p3'])).toMatchObject({
      path: '/api/meeting-recorder/units/u1/meetings',
      method: 'POST',
      body: { attendeePersonIds: ['p3'], meeting: { place: 'Hall', onlineLink: '' } },
    });
    expect(changeRequest(MEETING, draft)).toMatchObject({
      path: '/api/meeting-recorder/units/u1/meetings/m1',
      method: 'PUT',
      body: { version: 3 },
    });
  });

  it('sends a vote as whole numbers and its result, or a decision; a number that does not read is refused', () => {
    const vote = {
      ...outcomeDraftOf(ITEM),
      kind: 'vote' as const,
      votesFor: '5',
      votesAgainst: '2',
      votesAbstain: '0',
      voteResult: 'Carried',
    };
    expect(outcomeBodyOf(vote)).toEqual({
      kind: 'vote',
      votesFor: 5,
      votesAgainst: 2,
      votesAbstain: 0,
      voteResult: 'Carried',
    });
    expect(outcomeBodyOf({ ...vote, votesFor: '2.5' })).toBeNull();
    expect(outcomeBodyOf({ ...vote, kind: 'decision', decision: 'Agreed' })).toEqual({
      kind: 'decision',
      decision: 'Agreed',
    });
  });

  it('saves the minutes by itself only when they changed and nothing is already saving (D-207)', () => {
    expect(autosaveDue({ text: 'New', saved: 'Old', busy: false })).toBe(true);
    expect(autosaveDue({ text: 'Same', saved: 'Same', busy: false })).toBe(false);
    expect(autosaveDue({ text: 'New', saved: 'Old', busy: true })).toBe(false);
    expect(autosaveDue({ text: '  ', saved: '', busy: false })).toBe(false);
  });
});
