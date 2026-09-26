import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { registerRetirementRoutes } from '../library-retirement.routes';
import { addVenueNote, retireVenueNote } from './venue-notes.service';
import { venueDetailsSchema, venueNoteSchema, venueSaveSchema } from './venues.schema';
import { changeVenue, createVenue, listVenues, MANAGE } from './venues.service';

const VENUES = '/api/resources-library/units/:unitId/venues';
const VENUE = `${VENUES}/:venueId`;
const READ = { kind: 'capability', capability: 'resources-library.library.read' } as const;
const ACCESS = { kind: 'capability', capability: MANAGE } as const;
interface Context {
  req: { param: (name: string) => string };
}
const ids = (c: Context) => ({ unitId: c.req.param('unitId'), venueId: c.req.param('venueId') });

/** Brief 16 B1 (D-098, D-100, D-105 to D-107): venues and their notes. HTTP only. */
export function registerVenuesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: VENUES, access: READ });
  registerRoute({ method: 'POST', path: VENUES, access: ACCESS });
  registerRoute({ method: 'PUT', path: VENUE, access: ACCESS });
  registerRoute({ method: 'POST', path: `${VENUE}/notes`, access: ACCESS });
  registerRoute({ method: 'POST', path: `${VENUE}/notes/:noteId/retire`, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.get(VENUES, active, async (c) =>
    c.json(await listVenues(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(VENUES, active, async (c) => {
    const venue = venueDetailsSchema.parse(await c.req.json());
    return c.json(
      await createVenue(db, c.get('requestContext'), c.req.param('unitId'), venue),
      201,
    );
  });
  app.put(VENUE, active, async (c) => {
    const save = venueSaveSchema.parse(await c.req.json());
    await changeVenue(db, c.get('requestContext'), { ...ids(c), ...save });
    return c.body(null, 204);
  });
  app.post(`${VENUE}/notes`, active, async (c) => {
    const { text } = venueNoteSchema.parse(await c.req.json());
    await addVenueNote(db, c.get('requestContext'), { ...ids(c), text });
    return c.body(null, 201);
  });
  app.post(`${VENUE}/notes/:noteId/retire`, active, async (c) => {
    await retireVenueNote(db, c.get('requestContext'), {
      ...ids(c),
      noteId: c.req.param('noteId'),
    });
    return c.body(null, 204);
  });
  registerRetirementRoutes(app, db, keys, { kind: 'venue', itemPath: VENUE, idParam: 'venueId' });
}
