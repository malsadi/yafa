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
  };
}
