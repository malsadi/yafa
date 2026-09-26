import { describe, expect, it } from 'vitest';
import type { AccountRecord } from '../../../../src/shared/treasury/treasury-records';
import { AmountNotes } from '../../../../src/web/features/treasury/amount-notes';
import { EntryStatusBadge } from '../../../../src/web/features/treasury/entry-status-badge';
import {
  emptyMoneyEntry,
  moneyEntryOf,
} from '../../../../src/web/features/treasury/money-entry-draft';
import { WarningsList } from '../../../../src/web/features/treasury/warnings-list';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

const BANK: AccountRecord = {
  id: 'a1',
  unitId: 'u',
  kind: 'branch',
  name: 'Bank',
  branchType: 'bank',
  eventId: null,
  status: 'Open',
  balancePence: 1000,
  awaitingCount: 0,
  openedAt: 'x',
  openedOn: '2026-04-01',
  closedAt: null,
};

describe('the Treasury screens (brief 17; 28; D-120)', () => {
  it('warns, without blocking, when money going out takes an account below zero', async () => {
    setBrowserLanguages(['en-GB']);
    const below = await renderForTest(<AmountNotes amount="10.01" outOf={BANK} />);
    expect(below.textContent).toBe('This takes Bank below zero. It will be saved, with a warning.');
    expect((await renderForTest(<AmountNotes amount="10" outOf={BANK} />)).textContent).toBe('');
    expect((await renderForTest(<AmountNotes amount="£10" outOf={BANK} />)).textContent).toContain(
      'Write the amount in pounds',
    );
  });

  it('shows the saved warnings in words, with the balance as money', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <WarningsList
        accounts={[BANK]}
        warnings={[
          { code: 'below-zero', accountId: 'a1', balancePence: -2550 },
          { code: 'no-receipt' },
        ]}
      />,
    );
    expect(container.textContent).toContain('Bank is now below zero: -£25.50.');
    expect(container.textContent).toContain('Saved without a receipt.');
  });

  it('names the approval statuses exactly, and shows none for an entry that needed no approval (P7)', async () => {
    setBrowserLanguages(['en-GB']);
    expect((await renderForTest(<EntryStatusBadge status="Awaiting approval" />)).textContent).toBe(
      'Awaiting approval',
    );
    expect((await renderForTest(<EntryStatusBadge status="Declined" />)).textContent).toBe(
      'Declined',
    );
    expect((await renderForTest(<EntryStatusBadge status="Not needed" />)).textContent).toBe('');
  });

  it('turns the form into an entry in pence, with no budget line unless one is chosen', () => {
    const draft = {
      ...emptyMoneyEntry('a1'),
      amount: '12.5',
      counterparty: 'Donor',
      description: 'Gift',
    };
    expect(moneyEntryOf(draft)).toMatchObject({
      accountId: 'a1',
      amountPence: 1250,
      budgetLineId: null,
    });
    expect(moneyEntryOf({ ...draft, amount: 'twelve' })).toBeNull();
  });
});
