import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { seedOfficer } from '../app/app-fixtures';

// Migration 0057 (brief 14; T-085): past officers are kept. The database
// refuses to delete a term or a person, and to change a term once it has
// ended, whatever the application code does.
const termOf = (personId: string) =>
  env.DB.prepare('SELECT id FROM terms WHERE person_id = ?').bind(personId).first<{ id: string }>();

describe('register history is kept', () => {
  it('never deletes a term or a person', async () => {
    const { personId } = await seedOfficer({ suffix: 'H1' });
    await expect(
      env.DB.prepare('DELETE FROM terms WHERE person_id = ?').bind(personId).run(),
    ).rejects.toThrow(/terms are never deleted/);
    await expect(
      env.DB.prepare('DELETE FROM people WHERE id = ?').bind(personId).run(),
    ).rejects.toThrow(/people are never deleted/);
    expect(await termOf(personId)).not.toBeNull();
  });

  it('never changes an ended term, but a current one can still be ended', async () => {
    const { personId } = await seedOfficer({ suffix: 'H2' });
    await env.DB.prepare("UPDATE terms SET end_date = '2026-02-01' WHERE person_id = ?")
      .bind(personId)
      .run();
    await expect(
      env.DB.prepare("UPDATE terms SET end_date = '2026-03-01' WHERE person_id = ?")
        .bind(personId)
        .run(),
    ).rejects.toThrow(/an ended term is never changed/);
    await expect(
      env.DB.prepare("UPDATE terms SET start_date = '2025-01-01' WHERE person_id = ?")
        .bind(personId)
        .run(),
    ).rejects.toThrow(/an ended term is never changed/);
  });
});
