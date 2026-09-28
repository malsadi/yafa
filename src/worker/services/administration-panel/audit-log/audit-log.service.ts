import type {
  AuditEntry,
  AuditLogPage,
  AuditSearch,
} from '../../../../shared/administration-panel/audit-entry';
import {
  serviceOfAction,
  showsValues,
} from '../../../../shared/administration-panel/audit-services';
import { pageWindow, requireRowsPerPage } from '../../../core/pagination';
import type { RequestContext } from '../../../core/permissions';
import { requirePortalCapability } from '../operations-access';
import { listAuditActors, searchAudit, type AuditRow } from './audit-log.repo';

const CAPABILITY = 'administration-panel.audit-log.read';

/** O-167 and P22: before and after values only for the Administration panel's own changes. */
function entryOf(row: AuditRow): AuditEntry {
  const values = showsValues(row.action);
  return {
    ...row,
    service: serviceOfAction(row.action),
    before: values ? row.before : null,
    after: values ? row.after : null,
  };
}

/** Brief 25 D2: one page of the matching entries, the latest first. Read-only. */
export async function auditLogPage(
  db: D1Database,
  ctx: RequestContext,
  params: { search: AuditSearch; page: number },
): Promise<AuditLogPage> {
  await requirePortalCapability(db, ctx, CAPABILITY);
  const rowsPerPage = await requireRowsPerPage(db);
  const { rows, total } = await searchAudit(
    db,
    params.search,
    pageWindow(params.page, rowsPerPage),
  );
  return {
    items: rows.map(entryOf),
    page: Math.max(1, params.page),
    pageCount: Math.max(1, Math.ceil(total / rowsPerPage)),
    actors: await listAuditActors(db),
  };
}

const CSV_COLUMNS = [
  'occurredAt',
  'actorName',
  'action',
  'service',
  'entityType',
  'entityId',
  'before',
  'after',
] as const;

/** A CSV cell, quoted when it holds a comma, quote or line break. */
function cell(value: string | null): string {
  const text = value ?? '';
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Brief 25 D2: every matching entry as CSV, with the same rule for values. */
export async function auditLogCsv(
  db: D1Database,
  ctx: RequestContext,
  search: AuditSearch,
): Promise<string> {
  await requirePortalCapability(db, ctx, CAPABILITY);
  const { rows } = await searchAudit(db, search, null);
  const lines = rows.map(entryOf).map((e) => CSV_COLUMNS.map((c) => cell(e[c])).join(','));
  return `${[CSV_COLUMNS.join(','), ...lines].join('\r\n')}\r\n`;
}
