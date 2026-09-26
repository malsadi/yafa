import {
  AccountState,
  type AccountAction,
} from '../../../../shared/administration-panel/account-state';

export type OfficerAccountAction = AccountAction | 'invitation';

/**
 * Brief 25 A2: the actions that make sense in each account state — the
 * same rules the server applies (T-086, T-087). Without an account, only
 * an invitation; with one, the account actions for its lock state.
 */
export function accountActionsFor(state: AccountState): OfficerAccountAction[] {
  switch (state) {
    case AccountState.Active:
      return ['lock', 'sign-out', 'revoke-calendar-feed', 'remove-push-devices'];
    case AccountState.Locked:
      return ['unlock', 'sign-out', 'revoke-calendar-feed', 'remove-push-devices'];
    case AccountState.NotInvited:
    case AccountState.Invited:
    case AccountState.NotLinked:
      return ['invitation'];
  }
}
