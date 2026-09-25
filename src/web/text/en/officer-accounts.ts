/** Brief 25 A2: the officer accounts screen. */
export const officerAccountsText = {
  intro:
    'Every person in the register, with their access state. Register details are edited in the Committee register.',
  noPeople: 'No one is in the register yet.',
  lastInvited: 'last invited {date}',
  states: {
    'Not invited': 'Not invited',
    Invited: 'Invited',
    Active: 'Active',
    'Not linked': 'Not linked',
    Locked: 'Locked',
  },
  actions: {
    invitation: 'Resend invitation',
    lock: 'Lock',
    unlock: 'Unlock',
    'sign-out': 'Sign out of all sessions',
    'remove-push-devices': 'Remove push devices',
  },
  actionFor: {
    invitation: 'Resend invitation to {name}',
    lock: 'Lock {name}',
    unlock: 'Unlock {name}',
    'sign-out': 'Sign {name} out of all sessions',
    'remove-push-devices': 'Remove push devices of {name}',
  },
  done: {
    invitation: 'The invitation was sent.',
    lock: 'The account was locked.',
    unlock: 'The account was unlocked.',
    'sign-out': 'All sessions were signed out.',
    'remove-push-devices': 'Push devices were removed.',
  },
  invitationFailed: 'The invitation could not be sent. Try again later.',
  refusals: {
    'officer-accounts.not-found': 'This person is no longer in the register.',
    'officer-accounts.already-has-account': 'This person already has an account.',
    'officer-accounts.no-account': 'This person has no account.',
    'officer-accounts.already-locked': 'This account is already locked.',
    'officer-accounts.not-locked': 'This account is not locked.',
    'clerk.unavailable': 'The sign-in service could not be reached. Try again later.',
  },
};
