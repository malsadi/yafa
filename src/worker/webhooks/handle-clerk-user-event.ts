import type { UserJSON, UserWebhookEvent } from '@clerk/backend';
import {
  buildLinkPersonStatement,
  buildSyncPersonEmailStatement,
  buildUnlinkPersonStatement,
  findPersonIdByClerkUserId,
  findPersonIdByEmail,
} from './link-or-sync-person-repo';

function extractPrimaryOrFirstEmail(data: UserJSON): string | undefined {
  const primary = data.email_addresses.find(
    (address) => address.id === data.primary_email_address_id,
  );
  return (primary ?? data.email_addresses[0])?.email_address;
}

/**
 * Brief section 6.2: "a register officer adds an officer in the Committee
 * register; this sends a Clerk invitation to their email... when the
 * invitation is accepted, a Clerk webhook links the Clerk user to the
 * person record by email." Tries every address Clerk has for this user,
 * not only the primary — an officer may not have verified the invited
 * address as primary the instant they accept.
 *
 * **When no address matches any `people` row, this does nothing (T-065).**
 * Not stated in the brief either way; a person row is only ever created by
 * a register officer through the Committee register, never by this
 * webhook, so there is no non-destructive alternative to "wait for the
 * register to catch up" — inventing one (e.g. creating a placeholder
 * person) would be a guess this project's own rules don't allow.
 */
async function linkPersonFromClerkUser(db: D1Database, data: UserJSON): Promise<void> {
  for (const address of data.email_addresses) {
    const personId = await findPersonIdByEmail(db, address.email_address);
    if (personId) {
      await db.batch([buildLinkPersonStatement(db, { personId, clerkUserId: data.id })]);
      return;
    }
  }
}

/**
 * Brief section 6.2: "email changes in Clerk are synced by webhook." If
 * this Clerk user is already linked, syncs the stored email; webhooks
 * aren't guaranteed ordered, so an `user.updated` arriving before the
 * `user.created` that would normally link them falls back to the same
 * link attempt instead of silently doing nothing.
 */
async function syncOrLinkPersonFromClerkUser(db: D1Database, data: UserJSON): Promise<void> {
  const existing = await findPersonIdByClerkUserId(db, data.id);
  if (!existing) {
    await linkPersonFromClerkUser(db, data);
    return;
  }

  const email = extractPrimaryOrFirstEmail(data);
  if (email) {
    await db.batch([buildSyncPersonEmailStatement(db, { clerkUserId: data.id, email })]);
  }
}

async function unlinkPerson(db: D1Database, clerkUserId: string | undefined): Promise<void> {
  if (!clerkUserId) {
    return;
  }
  await db.batch([buildUnlinkPersonStatement(db, clerkUserId)]);
}

/**
 * Dispatches the three `user.*` events this portal reacts to. Every other
 * webhook event type (sessions, organizations, billing, ...) is ignored —
 * this portal doesn't use those Clerk features (brief section 6.1: Clerk
 * only answers "who is this person?").
 */
export async function handleClerkUserEvent(db: D1Database, event: UserWebhookEvent): Promise<void> {
  if (event.type === 'user.created') {
    await linkPersonFromClerkUser(db, event.data);
  } else if (event.type === 'user.updated') {
    await syncOrLinkPersonFromClerkUser(db, event.data);
  } else {
    await unlinkPerson(db, event.data.id);
  }
}
