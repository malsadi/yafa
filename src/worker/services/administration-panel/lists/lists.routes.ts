import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { orderList, restoreListItem, retireListItem } from './list-item-lifecycle.service';
import {
  addListItemSchema,
  listKeySchema,
  orderListSchema,
  renameListItemSchema,
} from './lists.schema';
import { addListItem, getLists, renameListItem } from './lists.service';

const PATH = '/api/administration-panel/lists';
const ACCESS = { kind: 'capability', capability: 'administration-panel.lists.manage' } as const;

/** Brief 25 B3; D-070, D-071: the lists — adding, renaming, retiring and ordering items. HTTP only. */
export function registerListsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'POST', path: `${PATH}/:list/items`, access: ACCESS });
  registerRoute({ method: 'PATCH', path: `${PATH}/:list/items/:itemId`, access: ACCESS });
  registerRoute({ method: 'POST', path: `${PATH}/:list/items/:itemId/retire`, access: ACCESS });
  registerRoute({ method: 'POST', path: `${PATH}/:list/items/:itemId/restore`, access: ACCESS });
  registerRoute({ method: 'PUT', path: `${PATH}/:list/order`, access: ACCESS });
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
  app.post(`${PATH}/:list/items/:itemId/retire`, active, async (c) => {
    const list = listKeySchema.parse(c.req.param('list'));
    await retireListItem(db, c.get('requestContext'), { list, itemId: c.req.param('itemId') });
    return c.body(null, 204);
  });
  app.post(`${PATH}/:list/items/:itemId/restore`, active, async (c) => {
    const list = listKeySchema.parse(c.req.param('list'));
    await restoreListItem(db, c.get('requestContext'), { list, itemId: c.req.param('itemId') });
    return c.body(null, 204);
  });
  app.put(`${PATH}/:list/order`, active, async (c) => {
    const list = listKeySchema.parse(c.req.param('list'));
    const { itemIds } = orderListSchema.parse(await c.req.json());
    await orderList(db, c.get('requestContext'), { list, itemIds });
    return c.body(null, 204);
  });
}
