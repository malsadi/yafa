import type { Hono } from 'hono';
import type { FileStorage } from '../../../core/files';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { READ, RECORD } from '../letter-access';
import { changeLetterInAnswers } from './letter-in-link.service';
import { changeLetterInHandler, moveLetterInStatus } from './letter-in-status.service';
import {
  completeLetterInSchema,
  letterInAnswersSchema,
  letterInHandlerSchema,
  letterInStatusSchema,
  startLetterInSchema,
} from './letters-in.schema';
import { downloadLetterIn, letterIn, lettersIn, recordingChoices } from './read-letters-in.service';
import { recordLetterIn, startLetterInUpload } from './record-letter-in.service';

const UNIT = '/api/correspondence-and-letters/units/:unitId';
const LETTERS = `${UNIT}/letters-in`;
const ONE = `${LETTERS}/:letterId`;
interface Params {
  req: { param: (name: string) => string };
}
const unitId = (c: Params) => c.req.param('unitId');
const ref = (c: Params) => ({
  unitId: c.req.param('unitId'),
  letterId: c.req.param('letterId'),
});

/**
 * Brief 23 B3, B4 and D-214: logging letters received, and the letters in
 * register. The letter's handling officer sees it and moves its status
 * with no capability, checked in the service (O-135). HTTP only.
 */
export function registerLettersInRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  storage: FileStorage,
): void {
  declareLettersInRoutes();
  const active = requireActiveAccess(db, keys);
  app.get(`${UNIT}/recording-choices`, active, async (c) =>
    c.json(await recordingChoices(db, c.get('requestContext'), unitId(c))),
  );
  app.post(`${LETTERS}/uploads`, active, async (c) => {
    const file = startLetterInSchema.parse(await c.req.json());
    return c.json(
      await startLetterInUpload(db, c.get('requestContext'), storage, {
        ...file,
        unitId: unitId(c),
      }),
    );
  });
  app.get(LETTERS, active, async (c) =>
    c.json(await lettersIn(db, c.get('requestContext'), unitId(c))),
  );
  app.put(ONE, active, async (c) => {
    const input = completeLetterInSchema.parse(await c.req.json());
    const letter = await recordLetterIn(db, c.get('requestContext'), storage, {
      ...input,
      ...ref(c),
    });
    return c.json(letter, 201);
  });
  app.get(ONE, active, async (c) => c.json(await letterIn(db, c.get('requestContext'), ref(c))));
  app.get(`${ONE}/file`, active, async (c) =>
    downloadLetterIn(db, c.get('requestContext'), storage, ref(c)),
  );
  registerLetterInChangeRoutes(app, db, active);
}

/** O-144, O-145 and D-216: a letter in's status, handling officer and link, each changed by version. */
function registerLetterInChangeRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  active: ReturnType<typeof requireActiveAccess>,
): void {
  app.put(`${ONE}/status`, active, async (c) => {
    const input = letterInStatusSchema.parse(await c.req.json());
    await moveLetterInStatus(db, c.get('requestContext'), { ...input, ...ref(c) });
    return c.body(null, 204);
  });
  app.put(`${ONE}/handler`, active, async (c) => {
    const input = letterInHandlerSchema.parse(await c.req.json());
    await changeLetterInHandler(db, c.get('requestContext'), { ...input, ...ref(c) });
    return c.body(null, 204);
  });
  app.put(`${ONE}/answers`, active, async (c) => {
    const input = letterInAnswersSchema.parse(await c.req.json());
    await changeLetterInAnswers(db, c.get('requestContext'), { ...input, ...ref(c) });
    return c.body(null, 204);
  });
}

/** The routes' access declarations, for the permission sweep (brief 7.4). */
function declareLettersInRoutes(): void {
  const read = { kind: 'capability', capability: READ } as const;
  const record = { kind: 'capability', capability: RECORD } as const;
  const readerOrHandler = { kind: 'signed-in-only' } as const;
  registerRoute({ method: 'GET', path: `${UNIT}/recording-choices`, access: record });
  registerRoute({ method: 'POST', path: `${LETTERS}/uploads`, access: record });
  registerRoute({ method: 'GET', path: LETTERS, access: read });
  registerRoute({ method: 'PUT', path: ONE, access: record });
  registerRoute({ method: 'GET', path: ONE, access: readerOrHandler });
  registerRoute({ method: 'GET', path: `${ONE}/file`, access: readerOrHandler });
  registerRoute({ method: 'PUT', path: `${ONE}/status`, access: readerOrHandler });
  registerRoute({ method: 'PUT', path: `${ONE}/handler`, access: record });
  registerRoute({ method: 'PUT', path: `${ONE}/answers`, access: record });
}
