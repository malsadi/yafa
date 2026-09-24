import { describe, expect, it } from 'vitest';
import { verifyClerkSessionToken } from '../../src/worker/middleware/verify-clerk-session-token';
import { generateTestClerkKeyPair, signTestSessionToken } from './clerk-session-fixtures';

const REQUEST_URL = 'https://portal.example.org/api/me';
const REQUEST_ORIGIN = 'https://portal.example.org';

function requestWithAuthorization(header?: string): Request {
  return new Request(REQUEST_URL, header ? { headers: { Authorization: header } } : {});
}

describe('verifyClerkSessionToken', () => {
  it('returns the sub claim for a validly signed, unexpired token issued for this origin', async () => {
    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const token = await signTestSessionToken(privateKey, {
      sub: 'user_test1',
      azp: REQUEST_ORIGIN,
    });

    const session = await verifyClerkSessionToken(requestWithAuthorization(`Bearer ${token}`), {
      jwtKey: publicKeyPem,
    });

    expect(session).toEqual({ clerkUserId: 'user_test1', secondFactorVerified: false });
  });

  it('rejects a token with no azp claim at all, since authorizedParties is always checked', async () => {
    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const token = await signTestSessionToken(privateKey, { sub: 'user_test1' });

    await expect(
      verifyClerkSessionToken(requestWithAuthorization(`Bearer ${token}`), {
        jwtKey: publicKeyPem,
      }),
    ).rejects.toMatchObject({ code: 'session.invalid', status: 401 });
  });

  it('rejects a missing Authorization header', async () => {
    await expect(
      verifyClerkSessionToken(requestWithAuthorization(), { jwtKey: 'unused' }),
    ).rejects.toMatchObject({ code: 'session.missing', status: 401 });
  });

  it('rejects an Authorization header that is not a Bearer token', async () => {
    await expect(
      verifyClerkSessionToken(requestWithAuthorization('Basic abc123'), { jwtKey: 'unused' }),
    ).rejects.toMatchObject({ code: 'session.missing', status: 401 });
  });

  it('rejects a token signed by a different key', async () => {
    const { privateKey } = await generateTestClerkKeyPair();
    const { publicKeyPem: wrongPublicKey } = await generateTestClerkKeyPair();
    const token = await signTestSessionToken(privateKey, {
      sub: 'user_test1',
      azp: REQUEST_ORIGIN,
    });

    await expect(
      verifyClerkSessionToken(requestWithAuthorization(`Bearer ${token}`), {
        jwtKey: wrongPublicKey,
      }),
    ).rejects.toMatchObject({ code: 'session.invalid', status: 401 });
  });

  it('rejects an expired token', async () => {
    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const token = await signTestSessionToken(privateKey, {
      sub: 'user_test1',
      azp: REQUEST_ORIGIN,
      iat: Math.floor(Date.now() / 1000) - 7200,
      exp: Math.floor(Date.now() / 1000) - 3600,
    });

    await expect(
      verifyClerkSessionToken(requestWithAuthorization(`Bearer ${token}`), {
        jwtKey: publicKeyPem,
      }),
    ).rejects.toMatchObject({ code: 'session.invalid', status: 401 });
  });

  it("rejects a token issued for a different frontend (azp mismatch against the request's own origin)", async () => {
    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const token = await signTestSessionToken(privateKey, {
      sub: 'user_test1',
      azp: 'https://a-different-origin.example.org',
    });

    await expect(
      verifyClerkSessionToken(requestWithAuthorization(`Bearer ${token}`), {
        jwtKey: publicKeyPem,
      }),
    ).rejects.toMatchObject({ code: 'session.invalid', status: 401 });
  });

  it.each([
    ['a second factor verified 5 minutes ago', [3, 5], true],
    ['a second factor verified just now', [0, 0], true],
    ['no second factor ever', [3, -1], false],
  ] as const)('reads %s from the fva claim (T-077)', async (_label, fva, expected) => {
    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const token = await signTestSessionToken(privateKey, {
      sub: 'user_fva',
      azp: REQUEST_ORIGIN,
      fva: [fva[0], fva[1]],
    });

    const session = await verifyClerkSessionToken(requestWithAuthorization(`Bearer ${token}`), {
      jwtKey: publicKeyPem,
    });

    expect(session.secondFactorVerified).toBe(expected);
  });
});
