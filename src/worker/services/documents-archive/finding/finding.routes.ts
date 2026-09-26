import type { Hono } from 'hono';
import { z } from 'zod';
import type { FileStorage } from '../../../core/files';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { archiveSearchSchema } from './finding.schema';
import {
  downloadVersion,
  listArchiveCategories,
  listArchiveUnits,
  openDocument,
  searchArchive,
} from './finding.service';

const BASE = '/api/documents-archive';
const DOCUMENT = `${BASE}/documents/:documentId`;
const FILE = `${DOCUMENT}/versions/:version/file`;
const ACCESS = { kind: 'capability', capability: 'documents-archive.documents.read' } as const;
const versionSchema = z.coerce.number().int().positive();

/** An empty search field means "any". */
function filledIn(query: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== ''));
}

/** Brief 15 B1, B2 and A4: search, open and download archived documents. HTTP only. */
export function registerFindingRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  storage: FileStorage,
): void {
  registerRoute({ method: 'GET', path: `${BASE}/categories`, access: ACCESS });
  registerRoute({ method: 'GET', path: `${BASE}/units`, access: ACCESS });
  registerRoute({ method: 'GET', path: `${BASE}/documents`, access: ACCESS });
  registerRoute({ method: 'GET', path: DOCUMENT, access: ACCESS });
  registerRoute({ method: 'GET', path: FILE, access: ACCESS });
  const active = requireActiveAccess(db, keys);

  app.get(`${BASE}/categories`, active, async (c) =>
    c.json(await listArchiveCategories(db, c.get('requestContext'))),
  );
  app.get(`${BASE}/units`, active, async (c) =>
    c.json(await listArchiveUnits(db, c.get('requestContext'))),
  );
  app.get(`${BASE}/documents`, active, async (c) => {
    const search = archiveSearchSchema.parse(filledIn(c.req.query()));
    return c.json(await searchArchive(db, c.get('requestContext'), search));
  });
  app.get(DOCUMENT, active, async (c) =>
    c.json(await openDocument(db, c.get('requestContext'), c.req.param('documentId'))),
  );
  app.get(FILE, active, async (c) =>
    downloadVersion(db, c.get('requestContext'), storage, {
      documentId: c.req.param('documentId'),
      version: versionSchema.parse(c.req.param('version')),
    }),
  );
}
