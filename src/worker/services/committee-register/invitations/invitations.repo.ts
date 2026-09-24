import { and, desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { invitations } from '../../../../db/schema/committee-register/invitations';
import { people } from '../../../../db/schema/committee-register/people';
import { generateId } from '../../../core/ids';

export async function hasSentInvitation(db: D1Database, personId: string): Promise<boolean> {
  const rows = await drizzle(db)
    .select({ id: invitations.id })
    .from(invitations)
    .where(and(eq(invitations.personId, personId), eq(invitations.status, 'sent')))
    .limit(1);
  return rows.length > 0;
}

export async function findInvitee(
  db: D1Database,
  personId: string,
): Promise<{ email: string; clerkUserId: string | null } | null> {
  const rows = await drizzle(db)
    .select({ email: people.email, clerkUserId: people.clerkUserId })
    .from(people)
    .where(eq(people.id, personId))
    .limit(1);
  return rows[0] ?? null;
}

export async function latestInvitationAt(db: D1Database, personId: string): Promise<string | null> {
  const rows = await drizzle(db)
    .select({ sentAt: invitations.sentAt })
    .from(invitations)
    .where(and(eq(invitations.personId, personId), eq(invitations.status, 'sent')))
    .orderBy(desc(invitations.sentAt))
    .limit(1);
  return rows[0]?.sentAt ?? null;
}

export function buildRecordInvitationStatement(
  db: D1Database,
  params: {
    personId: string;
    status: 'sent' | 'failed';
    clerkInvitationId: string | null;
    sentBy: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO invitations (id, person_id, status, clerk_invitation_id, sent_at, sent_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      generateId(),
      params.personId,
      params.status,
      params.clerkInvitationId,
      new Date().toISOString(),
      params.sentBy,
    );
}
