import { env } from 'cloudflare:workers';
import { Hono } from 'hono';
import { beforeEach, describe, expect, it } from 'vitest';
import { PermissionScope } from '../../src/shared/core/permission-scope';
import { handleAppError, ForbiddenError } from '../../src/worker/core/errors';
import {
  can,
  registerCapability,
  resetCapabilityCatalogueForTests,
  type RequestContext,
} from '../../src/worker/core/permissions';
import { buildAcknowledgePrivacyNoticeStatement } from '../../src/worker/core/privacy-notice';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
} from '../../src/worker/middleware/require-active-access';
import {
  generateTestClerkKeyPair,
  signTestSessionToken,
} from '../middleware/clerk-session-fixtures';
import {
  insertGrant,
  insertPerson,
  insertRole,
  insertSystemAdministrator,
  insertTerm,
  insertUnit,
} from '../core/permissions/permission-fixtures';

const ORIGIN = 'https://portal.example.org';
const CAPABILITY = 'sweep.fixture.read';

/**
 * Brief section 7.4's behavioural sweep, over real HTTP through the actual
 * middleware chain — the structural half (`route-sweep.test.ts`) only
 * proves every route declares a well-formed access class; this proves the
 * three named cases actually fail closed: a branch officer reading another
 * branch's records, a branch officer attempting a national action, and an
 * administrator reading content with no content capability of their own
 * (P22 — `isSystemAdmin` never substitutes for a real grant, T-042).
 */
function buildFixtureApp(jwtKey: string): Hono<{ Variables: ActiveAccessVariables }> {
  const app = new Hono<{ Variables: ActiveAccessVariables }>();
  app.onError(handleAppError);
  app.get('/api/fixture/:unitId', requireActiveAccess(env.DB, { jwtKey }), async (c) => {
    const ctx: RequestContext = c.get('requestContext');
    const unitId = c.req.param('unitId');
    const allowed = await can(env.DB, ctx, CAPABILITY, { unitId });
    if (!allowed) {
      throw new ForbiddenError('sweep.fixture.denied');
    }
    return c.json({ ok: true, unitId });
  });
  return app;
}

async function acknowledgeCurrentNotice(personId: string, noticeVersionId: string): Promise<void> {
  await env.DB.batch([
    buildAcknowledgePrivacyNoticeStatement(env.DB, { personId, noticeVersionId }),
  ]);
}

describe('permission sweep — behavioural (brief section 7.4)', () => {
  beforeEach(() => {
    resetCapabilityCatalogueForTests();
    registerCapability({
      capability: CAPABILITY,
      label: 'Sweep fixture',
      description: 'x',
      allowedScopes: [PermissionScope.OwnUnit, PermissionScope.AllUnits],
    });
  });

  it("a branch officer reading their own branch's records succeeds, but Branch B's fail with 403/404", async () => {
    const branchA = '01ARZ3NDEKTSV4RRFFQ69SWBA';
    const branchB = '01ARZ3NDEKTSV4RRFFQ69SWBB';
    const roleId = '01ARZ3NDEKTSV4RRFFQ69SWR1';
    const personId = '01ARZ3NDEKTSV4RRFFQ69SWP1';
    const noticeVersionId = '01ARZ3NDEKTSV4RRFFQ69SWN1';
    await insertUnit(env.DB, { id: branchA, type: 'branch', code: 'sweep-branch-a', name: 'A' });
    await insertUnit(env.DB, { id: branchB, type: 'branch', code: 'sweep-branch-b', name: 'B' });
    await insertRole(env.DB, { id: roleId, name: 'Branch officer' });
    await insertGrant(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69SWG1',
      roleId,
      capability: CAPABILITY,
      scope: PermissionScope.OwnUnit,
    });
    await insertPerson(env.DB, {
      id: personId,
      email: 'sweep1@example.org',
      clerkUserId: 'clerk_sweep_branch_officer',
    });
    await insertTerm(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69SWT1',
      personId,
      roleId,
      unitId: branchA,
      startDate: '2026-01-01',
    });
    await env.DB.batch([
      env.DB.prepare(
        'INSERT INTO privacy_notice_versions (id, text_en, text_ar, created_at) VALUES (?, ?, NULL, ?)',
      ).bind(noticeVersionId, 'x', new Date().toISOString()),
    ]);
    await acknowledgeCurrentNotice(personId, noticeVersionId);

    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const token = await signTestSessionToken(privateKey, {
      sub: 'clerk_sweep_branch_officer',
      azp: ORIGIN,
    });
    const app = buildFixtureApp(publicKeyPem);
    const authorized = { headers: { Authorization: `Bearer ${token}` } };

    const ownBranch = await app.request(`${ORIGIN}/api/fixture/${branchA}`, authorized);
    expect(ownBranch.status).toBe(200);

    const otherBranch = await app.request(`${ORIGIN}/api/fixture/${branchB}`, authorized);
    expect([403, 404]).toContain(otherBranch.status);
  });

  it('a branch officer attempting a national action fails with 403/404', async () => {
    const branchA = '01ARZ3NDEKTSV4RRFFQ69SWBC';
    const national = '01ARZ3NDEKTSV4RRFFQ69SWNL';
    const roleId = '01ARZ3NDEKTSV4RRFFQ69SWR2';
    const personId = '01ARZ3NDEKTSV4RRFFQ69SWP2';
    const noticeVersionId = '01ARZ3NDEKTSV4RRFFQ69SWN2';
    await insertUnit(env.DB, { id: branchA, type: 'branch', code: 'sweep-branch-c', name: 'C' });
    await insertUnit(env.DB, {
      id: national,
      type: 'national',
      code: 'sweep-national',
      name: 'GC',
    });
    await insertRole(env.DB, { id: roleId, name: 'Branch officer 2' });
    await insertGrant(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69SWG2',
      roleId,
      capability: CAPABILITY,
      scope: PermissionScope.OwnUnit,
    });
    await insertPerson(env.DB, {
      id: personId,
      email: 'sweep2@example.org',
      clerkUserId: 'clerk_sweep_national_attempt',
    });
    await insertTerm(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69SWT2',
      personId,
      roleId,
      unitId: branchA,
      startDate: '2026-01-01',
    });
    await env.DB.batch([
      env.DB.prepare(
        'INSERT INTO privacy_notice_versions (id, text_en, text_ar, created_at) VALUES (?, ?, NULL, ?)',
      ).bind(noticeVersionId, 'x', new Date().toISOString()),
    ]);
    await acknowledgeCurrentNotice(personId, noticeVersionId);

    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const token = await signTestSessionToken(privateKey, {
      sub: 'clerk_sweep_national_attempt',
      azp: ORIGIN,
    });
    const app = buildFixtureApp(publicKeyPem);

    const res = await app.request(`${ORIGIN}/api/fixture/${national}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect([403, 404]).toContain(res.status);
  });

  it('a system administrator with no content capability of their own fails to read content with 403/404 (P22)', async () => {
    const branchA = '01ARZ3NDEKTSV4RRFFQ69SWBD';
    const adminRoleId = '01ARZ3NDEKTSV4RRFFQ69SWR3';
    const personId = '01ARZ3NDEKTSV4RRFFQ69SWP3';
    const noticeVersionId = '01ARZ3NDEKTSV4RRFFQ69SWN3';
    await insertUnit(env.DB, { id: branchA, type: 'branch', code: 'sweep-branch-d', name: 'D' });
    // An admin role with NO grant at all for the fixture capability — an
    // administrator gains no access to content through the admin role.
    await insertRole(env.DB, { id: adminRoleId, name: 'System administrator role' });
    await insertPerson(env.DB, {
      id: personId,
      email: 'sweep3@example.org',
      clerkUserId: 'clerk_sweep_admin',
    });
    await insertTerm(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69SWT3',
      personId,
      roleId: adminRoleId,
      unitId: branchA,
      startDate: '2026-01-01',
    });
    await insertSystemAdministrator(env.DB, personId);
    await env.DB.batch([
      env.DB.prepare(
        'INSERT INTO privacy_notice_versions (id, text_en, text_ar, created_at) VALUES (?, ?, NULL, ?)',
      ).bind(noticeVersionId, 'x', new Date().toISOString()),
    ]);
    await acknowledgeCurrentNotice(personId, noticeVersionId);

    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const token = await signTestSessionToken(privateKey, { sub: 'clerk_sweep_admin', azp: ORIGIN });
    const app = buildFixtureApp(publicKeyPem);

    const res = await app.request(`${ORIGIN}/api/fixture/${branchA}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect([403, 404]).toContain(res.status);
  });
});
