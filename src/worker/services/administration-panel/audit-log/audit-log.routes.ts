import type { Hono } from 'hono';
import { z } from 'zod';
import { SERVICES, type ServiceSlug } from '../../../../shared/core/services';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { auditLogCsv, auditLogPage } from './audit-log.service';

const PATH = '/api/administration-panel/audit-log';
const ACCESS = { kind: 'capability', capability: 'administration-panel.audit-log.read' } as const;
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional();
const searchSchema = z.object({
  personId: z.string().min(1).optional(),
  service: z.enum(SERVICES.map((s) => s.slug) as [ServiceSlug, ...ServiceSlug[]]).optional(),
  entityType: z.string().min(1).optional(),
  entityId: z.string().min(1).optional(),
  from: date,
  to: date,
  page: z.coerce.number().int().positive().optional(),
});

/** Brief 25 D2: search the audit log, and export it as CSV. Read-only. HTTP only. */
export function registerAuditLogRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'GET', path: `${PATH}.csv`, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.get(PATH, active, async (c) => {
    const { page, ...search } = searchSchema.parse(c.req.query());
    return c.json(await auditLogPage(db, c.get('requestContext'), { search, page: page ?? 1 }));
  });
  app.get(`${PATH}.csv`, active, async (c) => {
    const search = searchSchema.omit({ page: true }).parse(c.req.query());
    return c.body(await auditLogCsv(db, c.get('requestContext'), search), 200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="audit-log.csv"',
    });
  });
}
