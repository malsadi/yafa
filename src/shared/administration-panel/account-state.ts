/** Brief 25 A2's account states, with the brief's exact labels (5.1). */
export const AccountState = {
  NotInvited: 'Not invited',
  Invited: 'Invited',
  Active: 'Active',
  NotLinked: 'Not linked',
  Locked: 'Locked',
} as const;

export type AccountState = (typeof AccountState)[keyof typeof AccountState];

export interface OfficerAccount {
  personId: string;
  name: string;
  email: string;
  state: AccountState;
  lastInvitedAt: string | null;
}
