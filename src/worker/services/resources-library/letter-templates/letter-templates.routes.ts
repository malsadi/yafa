import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { registerRetirementRoutes } from '../library-retirement.routes';
import { letterTemplateInputSchema, letterTemplateSaveSchema } from './letter-templates.schema';
import {
  createLetterTemplate,
  listLetterTemplates,
  updateLetterTemplate,
} from './letter-templates.service';

const PATH = '/api/resources-library/units/:unitId/letter-templates';
const ONE = `${PATH}/:templateId`;
const READ = { kind: 'capability', capability: 'resources-library.library.read' } as const;
const MANAGE = {
  kind: 'capability',
  capability: 'resources-library.letter-templates.manage',
} as const;

/** Brief 16 D1 (P19, D-100 to D-102, D-111): list, write, change, retire and bring back letter templates. HTTP only. */
export function registerLetterTemplatesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: PATH, access: READ });
  registerRoute({ method: 'POST', path: PATH, access: MANAGE });
  registerRoute({ method: 'PUT', path: ONE, access: MANAGE });
  const active = requireActiveAccess(db, keys);
  const ids = (c: { req: { param: (name: string) => string } }) => ({
    unitId: c.req.param('unitId'),
    templateId: c.req.param('templateId'),
  });

  app.get(PATH, active, async (c) =>
    c.json(await listLetterTemplates(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(PATH, active, async (c) => {
    const input = letterTemplateInputSchema.parse(await c.req.json());
    return c.json(
      await createLetterTemplate(db, c.get('requestContext'), c.req.param('unitId'), input),
      201,
    );
  });
  app.put(ONE, active, async (c) => {
    const save = letterTemplateSaveSchema.parse(await c.req.json());
    await updateLetterTemplate(db, c.get('requestContext'), { ...ids(c), ...save });
    return c.body(null, 204);
  });
  registerRetirementRoutes(app, db, keys, {
    kind: 'letter-template',
    itemPath: ONE,
    idParam: 'templateId',
  });
}
