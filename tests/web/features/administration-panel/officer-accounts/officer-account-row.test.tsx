import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AccountState } from '../../../../../src/shared/administration-panel/account-state';
import { OfficerAccountRow } from '../../../../../src/web/features/administration-panel/officer-accounts/officer-account-row';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

describe('OfficerAccountRow (brief 25 A2)', () => {
  it('shows the state and last invitation, and runs the chosen action', async () => {
    setBrowserLanguages(['en-GB']);
    const onAction = vi.fn();
    const container = await renderForTest(
      <ul>
        <OfficerAccountRow
          account={{
            personId: 'p1',
            name: 'Ada Example',
            email: 'ada.example@example.org',
            state: AccountState.Invited,
            lastInvitedAt: '2026-09-24T10:00:00.000Z',
          }}
          busy={false}
          onAction={onAction}
        />
      </ul>,
    );
    const button = container.querySelector('button');

    expect(container.textContent).toContain('Invited · last invited 24 September 2026');
    expect(button?.getAttribute('aria-label')).toBe('Resend invitation to Ada Example');
    await act(async () => {
      button?.click();
      await Promise.resolve();
    });
    expect(onAction).toHaveBeenCalledWith('invitation');
  });
});
