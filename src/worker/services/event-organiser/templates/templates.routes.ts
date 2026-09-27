import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { templateSaveSchema, templateSchema, versionSchema } from './templates.schema';
import {
  addTemplate,
  changeTemplate,
  CREATE,
  MANAGE_TEMPLATES,
  setTemplateRetired,
  templateChoices,
  unitTemplates,
} from './templates.service';

const UNIT = '/api/event-organiser/units/:unitId';
const TEMPLATES = `${UNIT}/templates`;
const ONE = `${TEMPLATES}/:templateId`;

/** Brief 21 A3, P15 and D-178: event templates — managed, and chosen from when creating. HTTP only. */
export function registerTemplatesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const manage = { kind: 'capability', capability: MANAGE_TEMPLATES } as const;
  registerRoute({ method: 'GET', path: TEMPLATES, access: manage });
  registerRoute({ method: 'POST', path: TEMPLATES, access: manage });
  registerRoute({ method: 'PUT', path: ONE, access: manage });
  registerRoute({ method: 'POST', path: `${ONE}/retire`, access: manage });
  registerRoute({ method: 'POST', path: `${ONE}/restore`, access: manage });
  registerRoute({
    method: 'GET',
    path: `${UNIT}/template-choices`,
    access: { kind: 'capability', capability: CREATE },
  });
  const active = requireActiveAccess(db, keys);
  app.get(TEMPLATES, active, async (c) =>
    c.json(await unitTemplates(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.get(`${UNIT}/template-choices`, active, async (c) =>
    c.json(await templateChoices(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(TEMPLATES, active, async (c) => {
    const input = templateSchema.parse(await c.req.json());
    return c.json(
      await addTemplate(db, c.get('requestContext'), c.req.param('unitId'), input),
      201,
    );
  });
  app.put(ONE, active, async (c) => {
    const save = templateSaveSchema.parse(await c.req.json());
    await changeTemplate(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      id: c.req.param('templateId'),
      ...save,
    });
    return c.body(null, 204);
  });
  registerRetireRoutes(app, db, active);
}

/** A template retired from new events, or brought back (D-178). */
function registerRetireRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  active: ReturnType<typeof requireActiveAccess>,
): void {
  for (const [action, retire] of [
    ['retire', true],
    ['restore', false],
  ] as const) {
    app.post(`${ONE}/${action}`, active, async (c) => {
      const { version } = versionSchema.parse(await c.req.json());
      const params = {
        unitId: c.req.param('unitId'),
        id: c.req.param('templateId'),
        version,
        retire,
      };
      await setTemplateRetired(db, c.get('requestContext'), params);
      return c.body(null, 204);
    });
  }
}
