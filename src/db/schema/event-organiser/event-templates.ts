import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 21 A3, P15 and D-178: a unit's event template — the General
// Council's are national — with its default tasks and budget lines.
// Retired and brought back, never deleted; each save sends its version
// (9.1). Changing one never changes events already created from it.
export const eventTemplates = sqliteTable(
  'event_templates',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    name: text('name').notNull(),
    retiredAt: text('retired_at'),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('event_templates_unit').on(table.unitId)],
);

// D-178: a default task — a title, an optional description, and how many
// days before the event's first day it is due; its owner is the lead officer.
export const eventTemplateTasks = sqliteTable(
  'event_template_tasks',
  {
    id: text('id').primaryKey(),
    templateId: text('template_id').notNull(),
    position: integer('position').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    daysBefore: integer('days_before').notNull(),
  },
  (table) => [index('event_template_tasks_template').on(table.templateId)],
);

// D-178 and D-131: a default budget line — a name and an amount in pence.
export const eventTemplateBudgetLines = sqliteTable(
  'event_template_budget_lines',
  {
    id: text('id').primaryKey(),
    templateId: text('template_id').notNull(),
    position: integer('position').notNull(),
    name: text('name').notNull(),
    amountPence: integer('amount_pence').notNull(),
  },
  (table) => [index('event_template_budget_lines_template').on(table.templateId)],
);
