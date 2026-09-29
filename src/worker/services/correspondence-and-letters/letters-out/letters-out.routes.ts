import type { Hono } from 'hono';
import type { FileStorage } from '../../../core/files';
import { pageAsked } from '../../../core/pagination';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { READ, WRITE } from '../letter-access';
import { generateLetter } from './generate-letter.service';
import { browserLetterRenderer } from './letter-renderer';
import { generateLetterSchema, previewLetterSchema } from './letters-out.schema';
import { previewLetterPdf } from './preview-letter.service';
import { downloadLetterOut, letterOut, lettersOut } from './read-letters-out.service';
import { writingChoices } from './writing-choices.service';
import type { PdfRendering } from '../../administration-panel';

const UNIT = '/api/correspondence-and-letters/units/:unitId';
const LETTERS = `${UNIT}/letters-out`;
const ONE = `${LETTERS}/:letterId`;
interface Params {
  req: { param: (name: string) => string };
}
const unitId = (c: Params) => c.req.param('unitId');
const ref = (c: Params) => ({
  unitId: c.req.param('unitId'),
  letterId: c.req.param('letterId'),
});

/** Brief 23 A1, A2, B2 and D-214: writing letters, and the letters out register. HTTP only. */
export function registerLettersOutRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  services: { storage: FileStorage; pdf: PdfRendering },
): void {
  declareLettersOutRoutes();
  const active = requireActiveAccess(db, keys);
  const render = browserLetterRenderer(services.pdf);
  app.get(`${UNIT}/writing-choices`, active, async (c) =>
    c.json(await writingChoices(db, c.get('requestContext'), unitId(c))),
  );
  app.post(`${LETTERS}/preview-pdf`, active, async (c) => {
    const input = previewLetterSchema.parse(await c.req.json());
    const pdf = await previewLetterPdf(db, c.get('requestContext'), render, {
      ...input,
      unitId: unitId(c),
    });
    return new Response(pdf, { headers: { 'Content-Type': 'application/pdf' } });
  });
  app.post(LETTERS, active, async (c) => {
    const input = generateLetterSchema.parse(await c.req.json());
    const letter = await generateLetter(
      db,
      c.get('requestContext'),
      { storage: services.storage, render },
      { ...input, unitId: unitId(c) },
    );
    return c.json(letter, 201);
  });
  app.get(LETTERS, active, async (c) =>
    c.json(
      await lettersOut(db, c.get('requestContext'), {
        unitId: unitId(c),
        page: pageAsked(c.req.query('page')),
      }),
    ),
  );
  app.get(ONE, active, async (c) => c.json(await letterOut(db, c.get('requestContext'), ref(c))));
  app.get(`${ONE}/file`, active, async (c) =>
    downloadLetterOut(db, c.get('requestContext'), services.storage, ref(c)),
  );
}

/** The routes' access declarations, for the permission sweep (brief 7.4). */
function declareLettersOutRoutes(): void {
  const read = { kind: 'capability', capability: READ } as const;
  const write = { kind: 'capability', capability: WRITE } as const;
  registerRoute({ method: 'GET', path: `${UNIT}/writing-choices`, access: write });
  registerRoute({ method: 'POST', path: `${LETTERS}/preview-pdf`, access: write });
  registerRoute({ method: 'POST', path: LETTERS, access: write });
  registerRoute({ method: 'GET', path: LETTERS, access: read });
  registerRoute({ method: 'GET', path: ONE, access: read });
  registerRoute({ method: 'GET', path: `${ONE}/file`, access: read });
}
