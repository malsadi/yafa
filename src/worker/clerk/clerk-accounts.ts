import { createClerkClient } from '@clerk/backend';

/**
 * The Clerk account actions the portal takes (brief 6.1, 6.2, 25 A2), behind
 * one small interface so routes are tested with a fake and never reach
 * Clerk or send a real email. Clerk answers "who is this person?"; nothing
 * about roles or units is ever sent to it.
 */
export interface ClerkAccounts {
  /** Sends a sign-up invitation to this address; resends if one is open. */
  invite: (email: string) => Promise<{ invitationId: string }>;
  /** Brief 25 A2: stop this account signing in, until unlocked. */
  lock: (clerkUserId: string) => Promise<void>;
  unlock: (clerkUserId: string) => Promise<void>;
  /** Brief 25 A2: end every active session of this account. */
  signOutEverywhere: (clerkUserId: string) => Promise<void>;
}

export function createClerkAccounts(secretKey: string): ClerkAccounts {
  const clerk = createClerkClient({ secretKey });
  return {
    invite: async (email) => {
      const invitation = await clerk.invitations.createInvitation({
        emailAddress: email,
        notify: true,
        ignoreExisting: true,
      });
      return { invitationId: invitation.id };
    },
    lock: async (clerkUserId) => {
      await clerk.users.lockUser(clerkUserId);
    },
    unlock: async (clerkUserId) => {
      await clerk.users.unlockUser(clerkUserId);
    },
    signOutEverywhere: async (clerkUserId) => {
      const sessions = await clerk.sessions.getSessionList({
        userId: clerkUserId,
        status: 'active',
      });
      await Promise.all(sessions.data.map((session) => clerk.sessions.revokeSession(session.id)));
    },
  };
}
