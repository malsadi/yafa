import { env } from 'cloudflare:workers';
import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { handleAppError } from '../../src/worker/core/errors';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
} from '../../src/worker/middleware/require-active-access';
import { buildAcknowledgePrivacyNoticeStatement } from '../../src/worker/core/privacy-notice';
import { generateTestClerkKeyPair, signTestSessionToken } from './clerk-session-fixtures';
import {
  insertPerson,
  insertRole,
  insertTerm,
  insertUnit,
} from '../core/permissions/permission-fixtures';

const ORIGIN = 'https://portal.example.org';

function buildApp(db: D1Database, jwtKey: string): Hono<{ Variables: ActiveAccessVariables }> {
  const app = new Hono<{ Variables: ActiveAccessVariables }>();
  app.onError(handleAppError);
  app.get('/api/fixture', requireActiveAccess(db, { jwtKey }), (c) =>
    c.json(c.get('requestContext')),
  );
  return app;
}

async function requestWithToken(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  privateKey: CryptoKey,
  sub: string,
): Promise<Response> {
  const token = await signTestSessionToken(privateKey, { sub, azp: ORIGIN });
  return app.request(`${ORIGIN}/api/fixture`, { headers: { Authorization: `Bearer ${token}` } });
}

describe('requireActiveAccess', () => {
  it('returns 401 with no Authorization header', async () => {
    const { publicKeyPem } = await generateTestClerkKeyPair();
    const app = buildApp(env.DB, publicKeyPem);

    const res = await app.request(`${ORIGIN}/api/fixture`);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: { code: 'session.missing' } });
  });

  it('returns 403 access.not-active for a signed-in user with no linked person', async () => {
    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const app = buildApp(env.DB, publicKeyPem);

    const res = await requestWithToken(app, privateKey, 'clerk_raa_unlinked');

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: { code: 'access.not-active' } });
  });

  it('returns 403 privacy-notice.not-set for an active person when no notice has ever been entered', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69RAA2';
    const unitId = '01ARZ3NDEKTSV4RRFFQ69RAU2';
    const roleId = '01ARZ3NDEKTSV4RRFFQ69RAR2';
    await insertUnit(env.DB, { id: unitId, type: 'branch', code: 'raa-branch-2', name: 'x' });
    await insertRole(env.DB, { id: roleId, name: 'x', unitId });
    await insertPerson(env.DB, {
      id: personId,
      email: 'raa2@example.org',
      clerkUserId: 'clerk_raa_notice_unset',
    });
    await insertTerm(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69RAT2',
      personId,
      roleId,
      unitId,
      startDate: '2026-01-01',
    });
    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const app = buildApp(env.DB, publicKeyPem);

    const res = await requestWithToken(app, privateKey, 'clerk_raa_notice_unset');

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: { code: 'privacy-notice.not-set' } });
  });

  it('returns 403 privacy-notice.not-acknowledged when a notice exists but is not ticked', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69RAA3';
    const unitId = '01ARZ3NDEKTSV4RRFFQ69RAU3';
    const roleId = '01ARZ3NDEKTSV4RRFFQ69RAR3';
    await insertUnit(env.DB, { id: unitId, type: 'branch', code: 'raa-branch-3', name: 'x' });
    await insertRole(env.DB, { id: roleId, name: 'x', unitId });
    await insertPerson(env.DB, {
      id: personId,
      email: 'raa3@example.org',
      clerkUserId: 'clerk_raa_notice_not_acked',
    });
    await insertTerm(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69RAT3',
      personId,
      roleId,
      unitId,
      startDate: '2026-01-01',
    });
    await env.DB.batch([
      env.DB.prepare(
        'INSERT INTO privacy_notice_versions (id, text_en, text_ar, created_at) VALUES (?, ?, NULL, ?)',
      ).bind('01ARZ3NDEKTSV4RRFFQ69RAN3', 'Notice text', new Date().toISOString()),
    ]);
    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const app = buildApp(env.DB, publicKeyPem);

    const res = await requestWithToken(app, privateKey, 'clerk_raa_notice_not_acked');

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: { code: 'privacy-notice.not-acknowledged' } });
  });

  it('passes through with the request context once fully cleared', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69RAA4';
    const unitId = '01ARZ3NDEKTSV4RRFFQ69RAU4';
    const roleId = '01ARZ3NDEKTSV4RRFFQ69RAR4';
    const noticeVersionId = '01ARZ3NDEKTSV4RRFFQ69RAN4';
    await insertUnit(env.DB, { id: unitId, type: 'branch', code: 'raa-branch-4', name: 'x' });
    await insertRole(env.DB, { id: roleId, name: 'x', unitId });
    await insertPerson(env.DB, {
      id: personId,
      email: 'raa4@example.org',
      clerkUserId: 'clerk_raa_active',
    });
    await insertTerm(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69RAT4',
      personId,
      roleId,
      unitId,
      startDate: '2026-01-01',
    });
    await env.DB.batch([
      env.DB.prepare(
        'INSERT INTO privacy_notice_versions (id, text_en, text_ar, created_at) VALUES (?, ?, NULL, ?)',
      ).bind(noticeVersionId, 'Notice text', new Date().toISOString()),
    ]);
    await env.DB.batch([
      buildAcknowledgePrivacyNoticeStatement(env.DB, { personId, noticeVersionId }),
    ]);
    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const app = buildApp(env.DB, publicKeyPem);

    const res = await requestWithToken(app, privateKey, 'clerk_raa_active');

    expect(res.status).toBe(200);
    const body: { personId: string } = await res.json();
    expect(body.personId).toBe(personId);
  });
});
