import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';

// Migration 0014: the database itself guards units and people (D-053,
// D-054, brief 14 A1), whatever the application code does.
function insertUnit(id: string, nameAr: string, status: string): Promise<D1Result> {
  return env.DB.prepare(
    `INSERT INTO units (id, type, code, name_en, name_ar, status, created_at)
     VALUES (?, 'branch', ?, 'Fictional Branch', ?, ?, '2026-01-01T00:00:00.000Z')`,
  )
    .bind(id, `rc-${id}`, nameAr, status)
    .run();
}

function insertPerson(id: string, name: string, phone: string): Promise<D1Result> {
  return env.DB.prepare(
    `INSERT INTO people (id, email, name, phone, created_at)
     VALUES (?, ?, ?, ?, '2026-01-01T00:00:00.000Z')`,
  )
    .bind(id, `${id}@example.org`, name, phone)
    .run();
}

describe('register table constraints', () => {
  it('accepts a complete unit and person', async () => {
    await insertUnit('u1', 'فرع تجريبي', 'active');
    await insertPerson('p1', 'Fictional Person', '07700 900001');

    const unit = await env.DB.prepare("SELECT status FROM units WHERE id = 'u1'").first<{
      status: string;
    }>();
    expect(unit?.status).toBe('active');
  });

  it('refuses a unit with no Arabic name, or an unknown status', async () => {
    await expect(insertUnit('u2', '', 'active')).rejects.toThrow(/CHECK/);
    await expect(insertUnit('u3', 'فرع', 'closed')).rejects.toThrow(/CHECK/);
  });

  it('refuses a person with no name or no phone', async () => {
    await expect(insertPerson('p2', '', '07700 900002')).rejects.toThrow(/CHECK/);
    await expect(insertPerson('p3', 'Fictional Person', '')).rejects.toThrow(/CHECK/);
  });
});
