import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';

function insertRole(id: string, nameAr: string, designation: string | null): Promise<D1Result> {
  return env.DB.prepare(
    `INSERT INTO roles (id, unit_id, name_en, name_ar, designation, created_at)
     VALUES (?, NULL, ?, ?, ?, '2026-01-01T00:00:00.000Z')`,
  )
    .bind(id, `Role ${id}`, nameAr, designation)
    .run();
}

// Migration 0010: the database itself guards the roles table (brief 7.2,
// 15 B2, D-052), whatever the application code does.
describe('roles table constraints', () => {
  it('lets only one role hold each designation', async () => {
    await insertRole('rc-1', 'دور ١', 'Branch register officer');

    await expect(insertRole('rc-2', 'دور ٢', 'Branch register officer')).rejects.toThrow(/UNIQUE/);
  });

  it('allows any number of roles with no designation', async () => {
    await insertRole('rc-3', 'دور ٣', null);
    await insertRole('rc-4', 'دور ٤', null);

    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM roles WHERE id IN ('rc-3', 'rc-4')",
    ).first<{ n: number }>();
    expect(row?.n).toBe(2);
  });

  it('refuses a designation the brief does not name', async () => {
    await expect(insertRole('rc-5', 'دور ٥', 'Chair')).rejects.toThrow(/CHECK/);
  });

  it('refuses an empty Arabic name', async () => {
    await expect(insertRole('rc-6', '', null)).rejects.toThrow(/CHECK/);
  });
});
