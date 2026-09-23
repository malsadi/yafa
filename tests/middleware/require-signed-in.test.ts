import { env } from 'cloudflare:workers';
import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { handleAppError } from '../../src/worker/core/errors';
import {
  requireSignedIn,
  type SignedInVariables,
} from '../../src/worker/middleware/require-signed-in';
import { buildAcknowledgePrivacyNoticeStatement } from '../../src/worker/core/privacy-notice';
import { generateTestClerkKeyPair, signTestSessionToken } from './clerk-session-fixtures';
import {
  insertPerson,
  insertRole,
  insertTerm,
  insertUnit,
} from '../core/permissions/permission-fixtures';

function buildApp(db: D1Database, jwtKey: string): Hono<{ Variables: SignedInVariables }> {
  const app = new Hono<{ Variables: SignedInVariables }>();
  app.onError(handleAppError);
  app.get('/api/me', requireSignedIn(db, { jwtKey }), (c) => c.json(c.get('sessionState')));
  return app;
}

describe('requireSignedIn', () => {
  it('returns 401 with no Authorization header', async () => {
    const { publicKeyPem } = await generateTestClerkKeyPair();
    const app = buildApp(env.DB, publicKeyPem);

    const res = await app.request('https://portal.example.org/api/me');

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: { code: 'session.missing' } });
  });

  it("reports not-active, never blocking, for a signed-in user who isn't linked", async () => {
    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const token = await signTestSessionToken(privateKey, {
      sub: 'clerk_signed_in_unlinked',
      azp: 'https://portal.example.org',
    });
    const app = buildApp(env.DB, publicKeyPem);

    const res = await app.request('https://portal.example.org/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'not-active' });
  });

  it('reports active, with the request context, for a fully cleared officer', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69RSA1';
    const unitId = '01ARZ3NDEKTSV4RRFFQ69RSU1';
    const roleId = '01ARZ3NDEKTSV4RRFFQ69RSR1';
    const noticeVersionId = '01ARZ3NDEKTSV4RRFFQ69RSN1';
    await insertUnit(env.DB, { id: unitId, type: 'branch', code: 'rsi-branch-1', name: 'x' });
    await insertRole(env.DB, { id: roleId, name: 'x', unitId });
    await insertPerson(env.DB, {
      id: personId,
      email: 'rsi-active@example.org',
      clerkUserId: 'clerk_rsi_active',
    });
    await insertTerm(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69RST1',
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
    const token = await signTestSessionToken(privateKey, {
      sub: 'clerk_rsi_active',
      azp: 'https://portal.example.org',
    });
    const app = buildApp(env.DB, publicKeyPem);

    const res = await app.request('https://portal.example.org/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    const body: { status: string; context?: { personId: string } } = await res.json();
    expect(body.status).toBe('active');
    expect(body.context?.personId).toBe(personId);
  });
});
