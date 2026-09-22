import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  handleAppError,
} from '../../../src/worker/core/errors';

function buildApp(): Hono {
  const app = new Hono();
  app.onError(handleAppError);
  app.get('/forbidden', () => {
    throw new ForbiddenError('treasury.debit.approve.forbidden');
  });
  app.get('/not-found', () => {
    throw new NotFoundError('treasury.entries.not-found');
  });
  app.get('/conflict', () => {
    throw new ConflictError('treasury.entries.stale');
  });
  app.get('/zod', () => {
    z.string().parse(123);
    return new Response();
  });
  app.get('/unknown', () => {
    throw new Error('a message that must never reach the response');
  });
  return app;
}

describe('handleAppError', () => {
  it('maps ForbiddenError to 403 with its code', async () => {
    const res = await buildApp().request('/forbidden');
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: { code: 'treasury.debit.approve.forbidden' } });
  });

  it('maps NotFoundError to 404 with its code', async () => {
    const res = await buildApp().request('/not-found');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: { code: 'treasury.entries.not-found' } });
  });

  it('maps ConflictError to 409 with its code', async () => {
    const res = await buildApp().request('/conflict');
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: { code: 'treasury.entries.stale' } });
  });

  it('maps a ZodError to 400 with a generic code, not the validation prose', async () => {
    const res = await buildApp().request('/zod');
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: { code: 'request.invalid' } });
  });

  it('maps any other error to 500 without leaking its message', async () => {
    const res = await buildApp().request('/unknown');
    expect(res.status).toBe(500);
    const body = await res.text();
    expect(body).not.toContain('must never reach the response');
    expect(JSON.parse(body)).toEqual({ error: { code: 'server.error' } });
  });
});
