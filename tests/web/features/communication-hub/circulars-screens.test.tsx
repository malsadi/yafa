import { describe, expect, it } from 'vitest';
import type { SentCircular } from '../../../../src/shared/communication-hub/circular-records';
import {
  emptyCircularDraft,
  sendRequest,
} from '../../../../src/web/features/communication-hub/circular-draft';
import { CircularReadConfirmation } from '../../../../src/web/features/communication-hub/circular-read-confirmation';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

const SENT: SentCircular = {
  id: 'c1',
  title: 'Annual meeting',
  body: 'Details.',
  sentAt: '2026-10-01T09:00:00.000Z',
  sentByName: 'Secretary',
  toAllBranches: true,
  recipients: [
    { unitId: 'b1', nameEn: 'North', nameAr: 'الشمال', openedAt: '2026-10-02T10:00:00.000Z' },
    { unitId: 'b2', nameEn: 'South', nameAr: 'الجنوب', openedAt: null },
  ],
};

describe('the circular screens (brief 20 A3, A4; P14; D-157)', () => {
  it('sends to all branches, or only to the chosen ones', () => {
    const draft = { ...emptyCircularDraft(), title: 'T', body: 'B' };
    expect(sendRequest('gc', draft).body).toEqual({ title: 'T', body: 'B', toAllBranches: true });
    expect(sendRequest('gc', { ...draft, to: 'chosen', unitIds: ['b1'] })).toEqual({
      path: '/api/communication-hub/units/gc/circulars',
      method: 'POST',
      body: { title: 'T', body: 'B', toAllBranches: false, unitIds: ['b1'] },
    });
  });

  it('shows how many branches have opened it, and which (A4)', async () => {
    setBrowserLanguages(['en-GB']);
    const view = await renderForTest(<CircularReadConfirmation circular={SENT} />);
    expect(view.querySelector('summary')?.textContent).toBe('Opened by 1 of 2 branches');
    expect(view.querySelectorAll('li')[1]?.textContent).toBe('South: not yet opened');
  });
});
