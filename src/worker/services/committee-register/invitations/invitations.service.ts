import type { ClerkAccounts } from '../../../clerk';
import { buildAuditStatement } from '../../../core/audit';
import { buildRecordInvitationStatement, findInvitee, hasSentInvitation } from './invitations.repo';

export type InvitationOutcome = 'sent' | 'failed' | 'not-needed';

/**
 * Brief 6.2: invite a person to sign in, recording the attempt either way.
 * Clerk and D1 are not atomic together, so a failure is recorded as
 * `failed` for the account screen to resend (25 A2), and nothing already
 * written is undone. Logs no personal data (brief 12).
 */
export async function sendInvitation(
  db: D1Database,
  clerk: ClerkAccounts,
  params: { personId: string; actorPersonId: string },
): Promise<Exclude<InvitationOutcome, 'not-needed'>> {
  const invitee = await findInvitee(db, params.personId);
  if (!invitee) {
    return 'failed';
  }
  let clerkInvitationId: string | null = null;
  try {
    clerkInvitationId = (await clerk.invite(invitee.email)).invitationId;
  } catch {
    console.error('invitation failed');
  }
  const status = clerkInvitationId ? 'sent' : 'failed';
  await db.batch([
    buildRecordInvitationStatement(db, {
      personId: params.personId,
      status,
      clerkInvitationId,
      sentBy: params.actorPersonId,
    }),
    buildAuditStatement(db, {
      actorPersonId: params.actorPersonId,
      action: `invitation.${status}`,
      entityType: 'person',
      entityId: params.personId,
    }),
  ]);
  return status;
}

/** Invites someone added to the register, unless they have an account or an invitation already. */
export async function inviteIfNeeded(
  db: D1Database,
  clerk: ClerkAccounts,
  params: { personId: string; actorPersonId: string },
): Promise<InvitationOutcome> {
  const invitee = await findInvitee(db, params.personId);
  if (!invitee || invitee.clerkUserId || (await hasSentInvitation(db, params.personId))) {
    return 'not-needed';
  }
  return sendInvitation(db, clerk, params);
}
