import type { OfficerAccount } from '../../../../shared/administration-panel/account-state';

/**
 * Every person with their account state (brief 25 A2, D-061), worked out
 * from what the portal recorded: locked by the portal; linked to Clerk
 * ("Active"); linked once, then the Clerk account deleted ("Not linked");
 * invited; or none of these. Ordered by name.
 */
export async function listAccountStates(db: D1Database): Promise<OfficerAccount[]> {
  const result = await db
    .prepare(
      `SELECT p.id AS personId, p.name AS name, p.email AS email,
         CASE
           WHEN p.account_locked_at IS NOT NULL THEN 'Locked'
           WHEN p.clerk_user_id IS NOT NULL THEN 'Active'
           WHEN p.clerk_unlinked_at IS NOT NULL THEN 'Not linked'
           WHEN EXISTS (SELECT 1 FROM invitations i WHERE i.person_id = p.id AND i.status = 'sent') THEN 'Invited'
           ELSE 'Not invited'
         END AS state,
         (SELECT MAX(sent_at) FROM invitations i WHERE i.person_id = p.id AND i.status = 'sent') AS lastInvitedAt
       FROM people p
       ORDER BY p.name`,
    )
    .all<OfficerAccount>();
  return result.results;
}
