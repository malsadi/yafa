const ROWS_PER_QUERY = 500;

/** One value as SQL: text quoted, numbers as they are, blobs as hex. */
function sqlValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    const bytes =
      value instanceof ArrayBuffer ? new Uint8Array(value) : new Uint8Array(value.buffer);
    return `X'${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')}'`;
  }
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `'${text.replaceAll("'", "''")}'`;
}

const quoted = (name: string) => `"${name.replaceAll('"', '""')}"`;

async function tableRows(db: D1Database, table: string): Promise<string[]> {
  const lines: string[] = [];
  for (let offset = 0; ; offset += ROWS_PER_QUERY) {
    const { results } = await db
      .prepare(`SELECT * FROM ${quoted(table)} LIMIT ? OFFSET ?`)
      .bind(ROWS_PER_QUERY, offset)
      .all();
    for (const row of results) {
      const columns = Object.keys(row).map(quoted).join(', ');
      const values = Object.values(row).map(sqlValue).join(', ');
      lines.push(`INSERT INTO ${quoted(table)} (${columns}) VALUES (${values});`);
    }
    if (results.length < ROWS_PER_QUERY) return lines;
  }
}

/**
 * Brief 11, 25 build notes and D-217 (O-161): the whole database as one SQL
 * file, read table by table through the Worker's own binding — the tables,
 * then every row, then the indexes and triggers last, so restoring into an
 * empty database never trips a trigger. The migrations table goes with it,
 * so later migrations carry on from where it was.
 */
export async function dumpDatabase(db: D1Database): Promise<string> {
  const { results: schema } = await db
    .prepare(
      `SELECT type, name, sql FROM sqlite_master
       WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'
       ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 ELSE 2 END, name`,
    )
    .all<{ type: string; name: string; sql: string }>();
  const tables = schema.filter((s) => s.type === 'table');
  const lines = ['PRAGMA defer_foreign_keys = on;', ...tables.map((t) => `${t.sql};`)];
  for (const table of tables) lines.push(...(await tableRows(db, table.name)));
  lines.push(...schema.filter((s) => s.type !== 'table').map((s) => `${s.sql};`));
  return `${lines.join('\n')}\n`;
}
