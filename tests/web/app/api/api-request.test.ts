import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../../src/web/app/api/api-error';
import { apiRequest } from '../../../../src/web/app/api/api-request';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiRequest (brief section 6.3)', () => {
  it('sends the session token in the Authorization header, never a cookie', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(Response.json({ ok: true })));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest(() => Promise.resolve('token-1'), '/api/me');

    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer token-1');
    expect(init.credentials).toBeUndefined();
  });

  it("turns a refusal into an ApiError carrying the Worker's code", async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve(
        Response.json({ error: { code: 'privacy-notice.version-changed' } }, { status: 409 }),
      ),
    );

    const call = apiRequest(() => Promise.resolve('t'), '/api/x', { method: 'POST', body: {} });

    await expect(call).rejects.toEqual(new ApiError(409, 'privacy-notice.version-changed'));
  });

  it('returns nothing for a 204', async () => {
    vi.stubGlobal('fetch', () => Promise.resolve(new Response(null, { status: 204 })));

    expect(
      await apiRequest(() => Promise.resolve('t'), '/api/x', { method: 'PUT' }),
    ).toBeUndefined();
  });
});
