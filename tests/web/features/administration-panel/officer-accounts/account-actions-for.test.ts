import { describe, expect, it } from 'vitest';
import { AccountState } from '../../../../../src/shared/administration-panel/account-state';
import { accountActionsFor } from '../../../../../src/web/features/administration-panel/officer-accounts/account-actions-for';

describe('accountActionsFor (brief 25 A2)', () => {
  it('offers only an invitation to anyone without an account', () => {
    expect(accountActionsFor(AccountState.NotInvited)).toEqual(['invitation']);
    expect(accountActionsFor(AccountState.Invited)).toEqual(['invitation']);
    expect(accountActionsFor(AccountState.NotLinked)).toEqual(['invitation']);
  });

  it('offers lock to an active account and unlock to a locked one, never both', () => {
    expect(accountActionsFor(AccountState.Active)).toEqual([
      'lock',
      'sign-out',
      'remove-push-devices',
    ]);
    expect(accountActionsFor(AccountState.Locked)).toEqual([
      'unlock',
      'sign-out',
      'remove-push-devices',
    ]);
  });
});
