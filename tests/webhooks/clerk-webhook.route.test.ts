import { env } from 'cloudflare:workers';
import { Hono } from 'hono';
import { beforeEach, describe, expect, it } from 'vitest';
import { handleAppError } from '../../src/worker/core/errors';
import { listRegisteredRoutes, resetRegistryForTests } from '../../src/worker/core/permissions';
import { registerClerkWebhookRoute } from '../../src/worker/webhooks';
import { findPersonIdByClerkUserId } from '../../src/worker/webhooks/link-or-sync-person-repo';
import { buildSignedWebhookRequest, generateTestWebhookSecret } from './clerk-webhook-fixtures';

const URL = 'https://portal.example.org/api/webhooks/clerk';

function buildApp(signingSecret: string): Hono {
  const app = new Hono();
  app.onError(handleAppError);
  registerClerkWebhookRoute(app, env.DB, signingSecret);
  return app;
}

function userCreatedPayload(clerkUserId: string, email: string) {
  return {
    type: 'user.created',
    object: 'event',
    data: {
      id: clerkUserId,
      primary_email_address_id: 'idn_1',
      email_addresses: [
        {
          id: 'idn_1',
          email_address: email,
          object: 'email_address',
          verification: null,
          linked_to: [],
        },
      ],
    },
  };
}

async function insertPerson(id: string, email: string): Promise<void> {
  await env.DB.prepare(
    'INSERT INTO people (id, email, clerk_user_id, created_at) VALUES (?, ?, NULL, ?)',
  )
    .bind(id, email, new Date().toISOString())
    .run();
}

describe('registerClerkWebhookRoute', () => {
  beforeEach(() => {
    resetRegistryForTests();
  });

  it('registers itself as a signed-webhook route', () => {
    buildApp('unused-secret-for-registration-only');

    expect(listRegisteredRoutes()).toEqual([
      { method: 'POST', path: '/api/webhooks/clerk', access: { kind: 'signed-webhook' } },
    ]);
  });

  it('accepts a validly signed request and links the matching person', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69WHR1';
    await insertPerson(personId, 'webhook-route@example.org');
    const secret = generateTestWebhookSecret();
    const app = buildApp(secret);
    const request = await buildSignedWebhookRequest(
      URL,
      secret,
      userCreatedPayload('clerk_route_1', 'webhook-route@example.org'),
    );

    const res = await app.request(request);

    expect(res.status).toBe(200);
    expect(await findPersonIdByClerkUserId(env.DB, 'clerk_route_1')).toBe(personId);
  });

  it('rejects a request signed with the wrong secret', async () => {
    const app = buildApp(generateTestWebhookSecret());
    const request = await buildSignedWebhookRequest(
      URL,
      generateTestWebhookSecret(),
      userCreatedPayload('clerk_route_2', 'irrelevant@example.org'),
    );

    const res = await app.request(request);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: { code: 'webhook.invalid-signature' } });
  });

  it('rejects a request with no signature headers at all', async () => {
    const app = buildApp(generateTestWebhookSecret());

    const res = await app.request(URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(userCreatedPayload('clerk_route_3', 'irrelevant@example.org')),
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: { code: 'webhook.invalid-signature' } });
  });
});
