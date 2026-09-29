import type { Hono } from 'hono';
import type { FileStorage } from '../../../core/files';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { MANAGE, READ } from '../achievement-access';
import { annualReport, annualReports, saveSummary, startReport } from './annual-report.service';
import { finaliseSchema, startReportSchema, summarySchema } from './annual-report.schema';
import { downloadReport, finaliseReport } from './finalise-report.service';
import { browserAnnualReportRenderer } from './report-renderer';
import type { PdfRendering } from '../../administration-panel';

const LIST = '/api/achievements-and-reports/units/:unitId/annual-reports';
const ONE = `${LIST}/:reportId`;

interface Params {
  req: { param: (name: string) => string };
}
const ref = (c: Params) => ({ unitId: c.req.param('unitId'), reportId: c.req.param('reportId') });

/** Brief 24 B2 and D-215: the unit's annual reports — started, reviewed, finalised. HTTP only. */
export function registerAnnualReportRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  services: { storage: FileStorage; pdf: PdfRendering },
): void {
  declareAnnualReportRoutes();
  const active = requireActiveAccess(db, keys);
  app.get(LIST, active, async (c) =>
    c.json(await annualReports(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(LIST, active, async (c) => {
    const { year } = startReportSchema.parse(await c.req.json());
    const unitId = c.req.param('unitId');
    return c.json(await startReport(db, c.get('requestContext'), { unitId, year }), 201);
  });
  app.get(ONE, active, async (c) =>
    c.json(await annualReport(db, c.get('requestContext'), ref(c))),
  );
  app.put(`${ONE}/summary`, active, async (c) => {
    const input = summarySchema.parse(await c.req.json());
    await saveSummary(db, c.get('requestContext'), { ...ref(c), ...input });
    return c.body(null, 204);
  });
  app.post(`${ONE}/finalise`, active, async (c) => {
    const input = finaliseSchema.parse(await c.req.json());
    const render = browserAnnualReportRenderer(services.pdf);
    await finaliseReport(
      db,
      c.get('requestContext'),
      { storage: services.storage, render },
      { ...ref(c), ...input },
    );
    return c.body(null, 204);
  });
  app.get(`${ONE}/file`, active, async (c) =>
    downloadReport(db, c.get('requestContext'), services.storage, ref(c)),
  );
}

/** The routes' access declarations, for the permission sweep (brief 7.4). */
function declareAnnualReportRoutes(): void {
  const read = { kind: 'capability', capability: READ } as const;
  const manage = { kind: 'capability', capability: MANAGE } as const;
  registerRoute({ method: 'GET', path: LIST, access: read });
  registerRoute({ method: 'POST', path: LIST, access: manage });
  registerRoute({ method: 'GET', path: ONE, access: read });
  registerRoute({ method: 'PUT', path: `${ONE}/summary`, access: manage });
  registerRoute({ method: 'POST', path: `${ONE}/finalise`, access: manage });
  registerRoute({ method: 'GET', path: `${ONE}/file`, access: read });
}
