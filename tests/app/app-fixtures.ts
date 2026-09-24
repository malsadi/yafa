import { buildPublishableKey } from '@clerk/shared/keys';
import { env } from 'cloudflare:workers';
import type { Hono } from 'hono';
import {
  resetCapabilityCatalogueForTests,
  resetRegistryForTests,
} from '../../src/worker/core/permissions';
import { buildApp } from '../../src/worker/app/build-app';
import {
  generateTestClerkKeyPair,
  signTestSessionToken,
} from '../middleware/clerk-session-fixtures';
import {
  insertPerson,
  insertRole,
  insertTerm,
  insertUnit,
} from '../core/permissions/permission-fixtures';

export const ORIGIN = 'https://portal.example.org';
const FIXTURE_PUBLISHABLE_KEY = buildPublishableKey('excited-mule-42.clerk.accounts.dev');

export interface TestApp {
  app: Hono;
  /** `secondFactor`: the session was verified with a second factor (T-077). */
  tokenFor: (clerkUserId: string, options?: { secondFactor?: boolean }) => Promise<string>;
}

/**
 * The real assembled app (T-066), with a throwaway RS256 key in place of
 * Clerk's (T-064's technique) and a fixture publishable key, so it builds
 * in CI where no `.dev.vars` exists. Resets the route registry and the
 * capability catalogue first, since `buildApp` registers every route and
 * capability and both reject duplicates.
 */
export async function buildTestApp(overrides: Partial<Env> = {}): Promise<TestApp> {
  resetRegistryForTests();
  resetCapabilityCatalogueForTests();
  const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
  const app = buildApp(
    { ...env, CLERK_PUBLISHABLE_KEY: FIXTURE_PUBLISHABLE_KEY, ...overrides },
    {
      jwtKey: publicKeyPem,
    },
  );
  return {
    app,
    tokenFor: (clerkUserId, options) =>
      signTestSessionToken(privateKey, {
        sub: clerkUserId,
        azp: ORIGIN,
        fva: options?.secondFactor ? [0, 0] : [0, -1],
      }),
  };
}

/** A fictional officer with one current term in one fictional branch. */
export async function seedOfficer(params: {
  suffix: string;
  unitName?: string;
  unitType?: 'national' | 'branch';
}): Promise<{ personId: string; unitId: string; clerkUserId: string }> {
  const { suffix } = params;
  const unitId = `01ARZ3NDEKTSV4RRFFQ69AU${suffix}`;
  const roleId = `01ARZ3NDEKTSV4RRFFQ69AR${suffix}`;
  const personId = `01ARZ3NDEKTSV4RRFFQ69AP${suffix}`;
  const clerkUserId = `clerk_app_${suffix}`;
  await insertUnit(env.DB, {
    id: unitId,
    type: params.unitType ?? 'branch',
    code: `app-branch-${suffix}`,
    name: params.unitName ?? `Branch ${suffix}`,
  });
  await insertRole(env.DB, { id: roleId, name: 'x', unitId });
  await insertPerson(env.DB, { id: personId, email: `${suffix}@example.org`, clerkUserId });
  await insertTerm(env.DB, {
    id: `01ARZ3NDEKTSV4RRFFQ69AT${suffix}`,
    personId,
    roleId,
    unitId,
    startDate: '2026-01-01',
  });
  return { personId, unitId, clerkUserId };
}

export async function insertNoticeVersion(id: string, createdAt: string): Promise<void> {
  await env.DB.prepare(
    'INSERT INTO privacy_notice_versions (id, text_en, text_ar, created_at) VALUES (?, ?, ?, ?)',
  )
    .bind(id, 'Fictional notice', 'إشعار تجريبي', createdAt)
    .run();
}

export async function acknowledgeNotice(personId: string, noticeVersionId: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO privacy_notice_acknowledgements (id, person_id, notice_version_id, acknowledged_at)
     VALUES (?, ?, ?, ?)`,
  )
    .bind(`ack-${personId}-${noticeVersionId}`, personId, noticeVersionId, new Date().toISOString())
    .run();
}

/**
 * Stands in for Workers Static Assets, which has no built files to serve
 * inside the worker test runner: answers every path with a small HTML page
 * and records which paths were asked for.
 */
export function fakeStaticAssets(): { assets: Fetcher; requestedPaths: string[] } {
  const requestedPaths: string[] = [];
  const assets = {
    fetch: (input: RequestInfo | URL) => {
      requestedPaths.push(new URL(input instanceof Request ? input.url : input).pathname);
      return Promise.resolve(
        new Response('<!doctype html><title>asset</title>', {
          headers: { 'Content-Type': 'text/html' },
        }),
      );
    },
  } as Fetcher;
  return { assets, requestedPaths };
}
