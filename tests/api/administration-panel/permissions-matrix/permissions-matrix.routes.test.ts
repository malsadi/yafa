import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { runMatrixBatch } from '../../../../src/worker/services/administration-panel/permissions-matrix/permissions-matrix-guards';
import {
  buildClearAllGrantsStatement,
  buildVersionStatement,
} from '../../../../src/worker/services/administration-panel/permissions-matrix/permissions-matrix-statements.repo';
import type { PermissionsMatrixView } from '../../../../src/shared/administration-panel/permissions-matrix';
import {
  insertRole,
  insertSystemAdministrator,
} from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const PATH = `${ORIGIN}/api/administration-panel/permissions-matrix`;
const NOTICE = '01ARZ3NDEKTSV4RRFFQ69PMNV';
const ROLE = '01ARZ3NDEKTSV4RRFFQ69PMRL';
const MATRIX_CAPABILITY = 'committee-register.register.read';
const FIXED_CAPABILITY = 'committee-register.officers.manage';

let admin: { clerkUserId: string; personId: string };
let officer: { clerkUserId: string };

async function call(clerkUserId: string, method: string, path: string, body?: unknown) {
  const { app, tokenFor } = await buildTestApp();
  return app.request(path, {
    method,
    headers: {
      Authorization: `Bearer ${await tokenFor(clerkUserId, { secondFactor: true })}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function setCell(scopes: string[], expectedVersion: number, capability = MATRIX_CAPABILITY) {
  return call(admin.clerkUserId, 'PUT', `${PATH}/cells`, {
    roleId: ROLE,
    capability,
    scopes,
    expectedVersion,
  });
}

async function readMatrix(): Promise<PermissionsMatrixView> {
  return (await call(admin.clerkUserId, 'GET', PATH)).json();
}

// Tests build on each other in order within this file's shared storage.
describe('permissions matrix (brief 25 A3, T-078)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await seedOfficer({ suffix: 'PM1', unitType: 'national' });
    await acknowledgeNotice(admin.personId, NOTICE);
    await insertSystemAdministrator(env.DB, admin.personId);
    const plain = await seedOfficer({ suffix: 'PM2' });
    await acknowledgeNotice(plain.personId, NOTICE);
    officer = plain;
    await insertRole(env.DB, { id: ROLE, name: 'Fixture role' });
  });

  it('shows the empty matrix at version 0, with the fixed rules marked', async () => {
    const matrix = await readMatrix();

    expect(matrix.version).toBe(0);
    expect(matrix.grants).toEqual([]);
    const fixed = matrix.capabilities.find((c) => c.capability === FIXED_CAPABILITY);
    expect(fixed?.fixedGrants?.length).toBeGreaterThan(0);
  });

  it('sets a cell as version 1, with its snapshot and an audit entry', async () => {
    const res = await setCell(['own unit'], 0);
    const snapshot = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM permission_matrix_version_grants g
       JOIN permission_matrix_versions v ON v.id = g.version_id WHERE v.number = 1`,
    ).first<{ n: number }>();
    const audit = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM audit_log WHERE action = 'permissions-matrix.cell-changed'",
    ).first<{ n: number }>();

    expect(await res.json()).toEqual({ version: 1 });
    expect((await readMatrix()).grants).toEqual([
      { roleId: ROLE, capability: MATRIX_CAPABILITY, scope: 'own unit' },
    ]);
    expect(snapshot?.n).toBe(1);
    expect(audit?.n).toBe(1);
  });

  it('refuses an edit made against a version that is no longer current', async () => {
    const res = await setCell(['all units'], 0);

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: { code: 'permissions-matrix.changed' } });
  });

  it('keeps the fixed rules locked (brief 7.3)', async () => {
    const res = await setCell(['own unit'], 1, FIXED_CAPABILITY);

    expect(await res.json()).toEqual({ error: { code: 'permissions-matrix.fixed-rule' } });
  });

  it('refuses a scope the capability does not allow', async () => {
    const res = await setCell(['national content'], 1);

    expect(await res.json()).toEqual({ error: { code: 'permissions-matrix.scope-not-allowed' } });
  });

  it('restores an earlier version as a new version', async () => {
    expect(await (await setCell(['all units'], 1)).json()).toEqual({ version: 2 });

    const res = await call(admin.clerkUserId, 'POST', `${PATH}/versions/1/restore`, {
      expectedVersion: 2,
    });
    const versions = await (
      await call(admin.clerkUserId, 'GET', `${PATH}/versions`)
    ).json<{ number: number; change: { kind: string } }[]>();

    expect(await res.json()).toEqual({ version: 3 });
    expect((await readMatrix()).grants.map((g) => g.scope)).toEqual(['own unit']);
    expect(versions.map((v) => [v.number, v.change.kind])).toEqual([
      [1, 'cell'],
      [2, 'cell'],
      [3, 'restore'],
    ]);
  });

  it('refuses every action to an officer without the capability', async () => {
    expect((await call(officer.clerkUserId, 'GET', PATH)).status).toBe(403);
    expect((await call(officer.clerkUserId, 'GET', `${PATH}/versions`)).status).toBe(403);
    expect(
      (
        await call(officer.clerkUserId, 'PUT', `${PATH}/cells`, {
          roleId: ROLE,
          capability: MATRIX_CAPABILITY,
          scopes: [],
          expectedVersion: 3,
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await call(officer.clerkUserId, 'POST', `${PATH}/versions/1/restore`, {
          expectedVersion: 3,
        })
      ).status,
    ).toBe(403);
  });

  it('keeps the history in the database: never changed, never out of sequence', async () => {
    await expect(env.DB.prepare('DELETE FROM permission_matrix_versions').run()).rejects.toThrow(
      /append-only/,
    );
    await expect(
      env.DB.prepare("UPDATE permission_matrix_versions SET change = '{}'").run(),
    ).rejects.toThrow(/append-only/);
    await expect(
      env.DB.prepare(
        "INSERT INTO permission_matrix_versions (id, number, change, created_at, created_by) VALUES ('x', 9, '{}', 'now', ?)",
      )
        .bind(admin.personId)
        .run(),
    ).rejects.toThrow(/next in sequence/);
  });

  it('refuses a racing change in SQL, writing none of its batch', async () => {
    const before = (await readMatrix()).grants;
    const racing = runMatrixBatch(env.DB, [
      buildVersionStatement(env.DB, {
        versionId: '01ARZ3NDEKTSV4RRFFQ69PMRC',
        number: 3,
        change: { kind: 'restore', fromVersion: 1 },
        actorPersonId: admin.personId,
      }),
      buildClearAllGrantsStatement(env.DB),
    ]);

    await expect(racing).rejects.toMatchObject({ code: 'permissions-matrix.changed', status: 409 });
    expect((await readMatrix()).grants).toEqual(before);
  });
});
