import type { Hono } from 'hono';
import type { ClerkAccounts } from '../../../clerk';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import {
  addCandidate,
  addPosition,
  recordResults,
  removeCandidate,
  removePosition,
} from './election-ballot.service';
import { confirmElection } from './election-confirmation.service';
import {
  addCandidateSchema,
  addPositionSchema,
  confirmElectionSchema,
  createElectionSchema,
  recordResultsSchema,
} from './elections.schema';
import { createElection, getElection, listElections } from './elections.service';

const UNIT = '/api/committee-register/units/:unitId/elections';
const ONE = '/api/committee-register/elections/:electionId';
const READ = { kind: 'capability', capability: 'committee-register.register.read' } as const;
const MANAGE = { kind: 'capability', capability: 'committee-register.elections.manage' } as const;
const CONFIRM = { kind: 'capability', capability: 'committee-register.elections.confirm' } as const;

type App = Hono<{ Variables: ActiveAccessVariables }>;
type Handler = ReturnType<typeof requireActiveAccess>;

const ctx = (c: { get: (key: 'requestContext') => ActiveAccessVariables['requestContext'] }) =>
  c.get('requestContext');

function mountElectionRoutes(app: App, db: D1Database, active: Handler): void {
  app.get(UNIT, active, async (c) =>
    c.json(await listElections(db, ctx(c), c.req.param('unitId'))),
  );
  app.post(UNIT, active, async (c) => {
    const input = createElectionSchema.parse(await c.req.json());
    return c.json(await createElection(db, ctx(c), c.req.param('unitId'), input), 201);
  });
  app.get(ONE, active, async (c) =>
    c.json(await getElection(db, ctx(c), c.req.param('electionId'))),
  );
}

function mountBallotRoutes(app: App, db: D1Database, active: Handler, clerk: ClerkAccounts): void {
  app.post(`${ONE}/positions`, active, async (c) => {
    const input = addPositionSchema.parse(await c.req.json());
    return c.json(await addPosition(db, ctx(c), c.req.param('electionId'), input), 201);
  });
  app.delete(`${ONE}/positions/:positionId`, active, async (c) =>
    c.json(await removePosition(db, ctx(c), c.req.param())),
  );
  app.post(`${ONE}/positions/:positionId/candidates`, active, async (c) => {
    const input = addCandidateSchema.parse(await c.req.json());
    return c.json(await addCandidate(db, ctx(c), { ...c.req.param(), input }), 201);
  });
  app.delete(`${ONE}/candidates/:candidateId`, active, async (c) =>
    c.json(await removeCandidate(db, ctx(c), c.req.param())),
  );
  app.put(`${ONE}/results`, active, async (c) => {
    const { results } = recordResultsSchema.parse(await c.req.json());
    return c.json(
      await recordResults(db, ctx(c), { electionId: c.req.param('electionId'), results }),
    );
  });
  app.post(`${ONE}/confirm`, active, async (c) => {
    const { termsStartDate } = confirmElectionSchema.parse(await c.req.json());
    const electionId = c.req.param('electionId');
    return c.json(await confirmElection(db, clerk, ctx(c), { electionId, termsStartDate }));
  });
}

/** Brief 14 C1, D-066: recording and confirming elections. HTTP only. No delete of an election. */
export function registerElectionsRoutes(
  app: App,
  db: D1Database,
  keys: ClerkVerificationKeys,
  clerk: ClerkAccounts,
): void {
  const routes = [
    ['GET', UNIT, READ],
    ['POST', UNIT, MANAGE],
    ['GET', ONE, READ],
    ['POST', `${ONE}/positions`, MANAGE],
    ['DELETE', `${ONE}/positions/:positionId`, MANAGE],
    ['POST', `${ONE}/positions/:positionId/candidates`, MANAGE],
    ['DELETE', `${ONE}/candidates/:candidateId`, MANAGE],
    ['PUT', `${ONE}/results`, MANAGE],
    ['POST', `${ONE}/confirm`, CONFIRM],
  ] as const;
  for (const [method, path, access] of routes) registerRoute({ method, path, access });
  const active = requireActiveAccess(db, keys);
  mountElectionRoutes(app, db, active);
  mountBallotRoutes(app, db, active, clerk);
}
