import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import type { UserJSON, UserWebhookEvent } from '@clerk/backend';
import { handleClerkUserEvent } from '../../src/worker/webhooks/handle-clerk-user-event';
import { findPersonIdByClerkUserId } from '../../src/worker/webhooks/link-or-sync-person-repo';

async function insertPerson(
  db: D1Database,
  params: { id: string; email: string; clerkUserId?: string },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO people (id, email, clerk_user_id, name, phone, created_at) VALUES (?, ?, ?, 'Fictional Person', '07700 900000', ?)`,
    )
    .bind(params.id, params.email, params.clerkUserId ?? null, new Date().toISOString())
    .run();
}

/** Only the fields `handleClerkUserEvent` actually reads — see its own file. */
function buildFixtureUserJson(params: {
  clerkUserId: string;
  emails: string[];
  primaryIndex?: number;
}): UserJSON {
  const emailAddresses = params.emails.map((email, index) => ({
    id: `idn_${String(index)}`,
    email_address: email,
    object: 'email_address',
    verification: null,
    linked_to: [],
  }));
  return {
    id: params.clerkUserId,
    email_addresses: emailAddresses,
    primary_email_address_id: emailAddresses[params.primaryIndex ?? 0]?.id ?? null,
  } as unknown as UserJSON;
}

function buildUserEvent(type: 'user.created' | 'user.updated', data: UserJSON): UserWebhookEvent {
  return { type, object: 'event', data, event_attributes: {} } as unknown as UserWebhookEvent;
}

function buildDeletedEvent(clerkUserId: string | undefined): UserWebhookEvent {
  return {
    type: 'user.deleted',
    object: 'event',
    data: { id: clerkUserId, object: 'user', deleted: true },
    event_attributes: {},
  } as unknown as UserWebhookEvent;
}

describe('handleClerkUserEvent — user.created', () => {
  it('links the matching person by email', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69WHE1';
    await insertPerson(env.DB, { id: personId, email: 'invited@example.org' });
    const event = buildUserEvent(
      'user.created',
      buildFixtureUserJson({ clerkUserId: 'clerk_created_1', emails: ['invited@example.org'] }),
    );

    await handleClerkUserEvent(env.DB, event);

    expect(await findPersonIdByClerkUserId(env.DB, 'clerk_created_1')).toBe(personId);
  });

  it('tries every address, not only the primary', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69WHE2';
    await insertPerson(env.DB, { id: personId, email: 'secondary@example.org' });
    const event = buildUserEvent(
      'user.created',
      buildFixtureUserJson({
        clerkUserId: 'clerk_created_2',
        emails: ['primary@example.org', 'secondary@example.org'],
        primaryIndex: 0,
      }),
    );

    await handleClerkUserEvent(env.DB, event);

    expect(await findPersonIdByClerkUserId(env.DB, 'clerk_created_2')).toBe(personId);
  });

  it('does nothing, without throwing, when no address matches any person', async () => {
    const event = buildUserEvent(
      'user.created',
      buildFixtureUserJson({ clerkUserId: 'clerk_created_3', emails: ['nobody@example.org'] }),
    );

    await expect(handleClerkUserEvent(env.DB, event)).resolves.toBeUndefined();
    expect(await findPersonIdByClerkUserId(env.DB, 'clerk_created_3')).toBeNull();
  });
});

describe('handleClerkUserEvent — user.updated', () => {
  it('syncs the stored email for an already-linked person', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69WHE4';
    await insertPerson(env.DB, {
      id: personId,
      email: 'old@example.org',
      clerkUserId: 'clerk_updated_1',
    });
    const event = buildUserEvent(
      'user.updated',
      buildFixtureUserJson({ clerkUserId: 'clerk_updated_1', emails: ['changed@example.org'] }),
    );

    await handleClerkUserEvent(env.DB, event);

    const row = await env.DB.prepare('SELECT email FROM people WHERE id = ?')
      .bind(personId)
      .first<{ email: string }>();
    expect(row?.email).toBe('changed@example.org');
  });

  it('falls back to linking by email when not yet linked (webhooks are not guaranteed ordered)', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69WHE5';
    await insertPerson(env.DB, { id: personId, email: 'not-yet-linked@example.org' });
    const event = buildUserEvent(
      'user.updated',
      buildFixtureUserJson({
        clerkUserId: 'clerk_updated_2',
        emails: ['not-yet-linked@example.org'],
      }),
    );

    await handleClerkUserEvent(env.DB, event);

    expect(await findPersonIdByClerkUserId(env.DB, 'clerk_updated_2')).toBe(personId);
  });
});

describe('handleClerkUserEvent — user.deleted', () => {
  it('unlinks the person, leaving the record in place (brief section 6.2)', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69WHE6';
    await insertPerson(env.DB, {
      id: personId,
      email: 'leaving@example.org',
      clerkUserId: 'clerk_deleted_1',
    });

    await handleClerkUserEvent(env.DB, buildDeletedEvent('clerk_deleted_1'));

    expect(await findPersonIdByClerkUserId(env.DB, 'clerk_deleted_1')).toBeNull();
    const row = await env.DB.prepare('SELECT id FROM people WHERE id = ?').bind(personId).first();
    expect(row).not.toBeNull();
  });
});
