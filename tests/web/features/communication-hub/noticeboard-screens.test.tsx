import { describe, expect, it } from 'vitest';
import type { NoticeRecord } from '../../../../src/shared/communication-hub/notice-records';
import { draftOf, saveRequest } from '../../../../src/web/features/communication-hub/notice-draft';
import { NoticeHeading } from '../../../../src/web/features/communication-hub/notice-heading';
import { NoticeVoteResults } from '../../../../src/web/features/communication-hub/notice-vote-results';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

const VOTE = {
  question: 'Which date?',
  closesOn: '2026-12-01',
  closed: true,
  eligibility: 'named' as const,
  roleIds: [],
  namedPersonIds: ['p1'],
  options: [
    { id: 'o1', label: 'May' },
    { id: 'o2', label: 'June' },
  ],
  hasVotes: true,
  mayVote: false,
  myOptionId: null,
  results: [{ optionId: 'o1', count: 3 }],
};
const NOTICE: NoticeRecord = {
  id: 'n1',
  unitId: 'u1',
  source: 'officer',
  automaticKind: null,
  title: 'Hall',
  body: 'Booked.',
  aboutDate: null,
  retiredAt: null,
  version: 2,
  createdAt: '2026-10-01T09:00:00.000Z',
  postedByName: 'Officer',
  vote: VOTE,
};

describe('the Noticeboard screens (brief 20 A1, A2; P11, P12; D-155, D-156)', () => {
  it('posts a notice with a vote open to named officers (P11)', () => {
    const draft = { ...draftOf(), title: 'New', body: 'Text.', withVote: true };
    draft.vote = {
      ...draft.vote,
      question: 'Q?',
      options: ['A', 'B'],
      closesOn: '2026-12-01',
      eligibility: 'named',
      personIds: ['p1'],
    };
    expect(saveRequest('u1', draft)).toEqual({
      path: '/api/communication-hub/units/u1/notices',
      method: 'POST',
      body: {
        title: 'New',
        body: 'Text.',
        vote: {
          question: 'Q?',
          options: ['A', 'B'],
          closesOn: '2026-12-01',
          eligibility: { kind: 'named', personIds: ['p1'] },
        },
      },
    });
  });

  it('leaves a vote out of a change once anyone has voted, and takes it off when unticked before then (D-155)', () => {
    expect(saveRequest('u1', { ...draftOf(NOTICE), title: 'Hall (May)' }, NOTICE).body).toEqual({
      version: 2,
      notice: { title: 'Hall (May)', body: 'Booked.' },
    });
    const open = { ...NOTICE, vote: { ...VOTE, hasVotes: false } };
    expect(saveRequest('u1', { ...draftOf(open), withVote: false }, open).body).toEqual({
      version: 2,
      notice: { title: 'Hall', body: 'Booked.', vote: null },
    });
  });

  it('shows the counts only — every option, none as zero (D-156)', async () => {
    setBrowserLanguages(['en-GB']);
    const results = await renderForTest(<NoticeVoteResults vote={VOTE} results={VOTE.results} />);
    expect([...results.querySelectorAll('li')].map((li) => li.textContent)).toEqual([
      'May: Votes: 3',
      'June: Votes: 0',
    ]);
  });

  it('marks an automatic post as automatic, in the officer’s language (20 A1)', async () => {
    setBrowserLanguages(['ar']);
    const automatic: NoticeRecord = {
      ...NOTICE,
      source: 'automatic',
      automaticKind: 'meeting-scheduled',
      title: 'اجتماع اللجنة',
      body: null,
      aboutDate: '2026-12-01',
      postedByName: null,
      vote: null,
    };
    const heading = await renderForTest(<NoticeHeading notice={automatic} />);
    expect(heading.textContent).toContain('تلقائي');
    expect(heading.textContent).toContain('حُدّد موعد اجتماع: اجتماع اللجنة');
  });
});
