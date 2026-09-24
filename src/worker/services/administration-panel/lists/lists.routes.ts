import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { addListItemSchema, listKeySchema, renameListItemSchema } from './lists.schema';
import { addListItem, getLists, renameListItem } from './lists.service';

const PATH = '/api/administration-panel/lists';
const ACCESS = { kind: 'capability', capability: 'administration-panel.lists.manage' } as const;

/** Brief 25 B3: the lists, adding items and renaming them. HTTP only. */
export function registerListsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'POST', path: `${PATH}/:list/items`, access: ACCESS });
  registerRoute({ method: 'PATCH', path: `${PATH}/:list/items/:itemId`, access: ACCESS });
  const active = requireActiveAccess(db, keys);

  app.get(PATH, active, async (c) => c.json(await getLists(db, c.get('requestContext'))));
  app.post(`${PATH}/:list/items`, active, async (c) => {
    const list = listKeySchema.parse(c.req.param('list'));
    const input = addListItemSchema.parse(await c.req.json());
    return c.json(await addListItem(db, c.get('requestContext'), list, input), 201);
  });
  app.patch(`${PATH}/:list/items/:itemId`, active, async (c) => {
    const list = listKeySchema.parse(c.req.param('list'));
    const changes = renameListItemSchema.parse(await c.req.json());
    return c.json(
      await renameListItem(db, c.get('requestContext'), {
        list,
        itemId: c.req.param('itemId'),
        changes,
      }),
    );
  });
}
