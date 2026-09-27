import type { EventTemplateRecord } from '../../../../shared/event-organiser/event-records';
import { generateId } from '../../../core/ids';
import type { TemplateInput } from './templates.schema';

interface TemplateRow {
  id: string;
  unitId: string;
  name: string;
  retiredAt: string | null;
  version: number;
}

const SELECT =
  'SELECT id, unit_id AS unitId, name, retired_at AS retiredAt, version FROM event_templates';

/** Brief 21 A3 and D-178: the templates of these units, each with its default tasks and budget lines. */
export async function listTemplates(
  db: D1Database,
  unitIds: string[],
): Promise<EventTemplateRecord[]> {
  if (unitIds.length === 0) return [];
  const marks = unitIds.map(() => '?').join(', ');
  const { results } = await db
    .prepare(`${SELECT} WHERE unit_id IN (${marks}) ORDER BY name, id`)
    .bind(...unitIds)
    .all<TemplateRow>();
  return Promise.all(results.map((row) => withContents(db, row)));
}

export async function findTemplate(
  db: D1Database,
  id: string,
): Promise<EventTemplateRecord | null> {
  const row = await db.prepare(`${SELECT} WHERE id = ?`).bind(id).first<TemplateRow>();
  return row ? withContents(db, row) : null;
}

async function withContents(db: D1Database, row: TemplateRow): Promise<EventTemplateRecord> {
  const [tasks, lines] = await db.batch([
    db
      .prepare(
        'SELECT title, description, days_before AS daysBefore FROM event_template_tasks WHERE template_id = ? ORDER BY position',
      )
      .bind(row.id),
    db
      .prepare(
        'SELECT name, amount_pence AS amountPence FROM event_template_budget_lines WHERE template_id = ? ORDER BY position',
      )
      .bind(row.id),
  ]);
  return {
    ...row,
    tasks: (tasks?.results ?? []) as EventTemplateRecord['tasks'],
    budgetLines: (lines?.results ?? []) as EventTemplateRecord['budgetLines'],
  };
}

/** The default tasks and budget lines, written afresh: the rows a template holds now. */
export function buildTemplateContentStatements(
  db: D1Database,
  templateId: string,
  template: TemplateInput,
): D1PreparedStatement[] {
  return [
    db.prepare('DELETE FROM event_template_tasks WHERE template_id = ?').bind(templateId),
    db.prepare('DELETE FROM event_template_budget_lines WHERE template_id = ?').bind(templateId),
    ...template.tasks.map((task, index) =>
      db
        .prepare(
          'INSERT INTO event_template_tasks (id, template_id, position, title, description, days_before) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .bind(generateId(), templateId, index + 1, task.title, task.description, task.daysBefore),
    ),
    ...template.budgetLines.map((line, index) =>
      db
        .prepare(
          'INSERT INTO event_template_budget_lines (id, template_id, position, name, amount_pence) VALUES (?, ?, ?, ?, ?)',
        )
        .bind(generateId(), templateId, index + 1, line.name, line.amountPence),
    ),
  ];
}

export function buildInsertTemplateStatement(
  db: D1Database,
  row: { id: string; unitId: string; name: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO event_templates (id, unit_id, name, retired_at, version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, ?, NULL, 1, ?, ?, ?, ?)`,
    )
    .bind(row.id, row.unitId, row.name, row.actor, row.at, row.actor, row.at);
}

/** A change from `version`; the trigger refuses it unless the stored version is still `version` (9.1). */
export function buildUpdateTemplateStatement(
  db: D1Database,
  row: {
    id: string;
    name: string;
    retiredAt: string | null;
    version: number;
    actor: string;
    at: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      'UPDATE event_templates SET name = ?, retired_at = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?',
    )
    .bind(row.name, row.retiredAt, row.version + 1, row.actor, row.at, row.id);
}
