import type { VerifiedSession } from '../../src/worker/middleware';
import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { resolveSessionState } from '../../src/worker/middleware/resolve-session-state';
import { buildAcknowledgePrivacyNoticeStatement } from '../../src/worker/core/privacy-notice';
import { resetSettingsRegistryForTests, setSetting } from '../../src/worker/core/settings';
import { registerCommitteeRegisterSettings } from '../../src/worker/services/committee-register/settings';
import {
  insertPerson,
  insertRole,
  insertSystemAdministrator,
  insertTerm,
  insertUnit,
} from '../core/permissions/permission-fixtures';

function insertNoticeVersionStatement(id: string): D1PreparedStatement {
  return env.DB.prepare(
    'INSERT INTO privacy_notice_versions (id, text_en, text_ar, created_at) VALUES (?, ?, NULL, ?)',
  ).bind(id, 'Notice text', new Date().toISOString());
}

function session(clerkUserId: string, secondFactorVerified = false): VerifiedSession {
  return { clerkUserId, secondFactorVerified };
}

describe('resolveSessionState', () => {
  beforeAll(() => {
    resetSettingsRegistryForTests();
    registerCommitteeRegisterSettings();
  });

  it('is not-active for a clerkUserId with no linked person', async () => {
    expect(await resolveSessionState(env.DB, session('clerk_user_unlinked'))).toEqual({
      status: 'not-active',
    });
  });

  it('is not-active for a linked person with no current term', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69SSA1';
    await insertPerson(env.DB, { id: personId, email: 'a@example.org', clerkUserId: 'clerk_a' });

    expect(await resolveSessionState(env.DB, session('clerk_a'))).toEqual({ status: 'not-active' });
  });

  it('is notice-not-set for an active person when no notice has ever been entered', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69SSA2';
    const unitId = '01ARZ3NDEKTSV4RRFFQ69SSU2';
    const roleId = '01ARZ3NDEKTSV4RRFFQ69SSR2';
    await insertUnit(env.DB, { id: unitId, type: 'branch', code: 'ss-branch-2', name: 'x' });
    await insertRole(env.DB, { id: roleId, name: 'x', unitId });
    await insertPerson(env.DB, { id: personId, email: 'b@example.org', clerkUserId: 'clerk_b' });
    await insertTerm(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69SST2',
      personId,
      roleId,
      unitId,
      startDate: '2026-01-01',
    });

    expect(await resolveSessionState(env.DB, session('clerk_b'))).toEqual({
      status: 'notice-not-set',
      personId,
    });
  });

  it('is notice-not-acknowledged when a notice exists but this person has not ticked it', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69SSA3';
    const unitId = '01ARZ3NDEKTSV4RRFFQ69SSU3';
    const roleId = '01ARZ3NDEKTSV4RRFFQ69SSR3';
    await insertUnit(env.DB, { id: unitId, type: 'branch', code: 'ss-branch-3', name: 'x' });
    await insertRole(env.DB, { id: roleId, name: 'x', unitId });
    await insertPerson(env.DB, { id: personId, email: 'c@example.org', clerkUserId: 'clerk_c' });
    await insertTerm(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69SST3',
      personId,
      roleId,
      unitId,
      startDate: '2026-01-01',
    });
    await env.DB.batch([insertNoticeVersionStatement('01ARZ3NDEKTSV4RRFFQ69SSN3')]);

    expect(await resolveSessionState(env.DB, session('clerk_c'))).toEqual({
      status: 'notice-not-acknowledged',
      personId,
      noticeVersionId: '01ARZ3NDEKTSV4RRFFQ69SSN3',
    });
  });

  it('is active once the current notice has been acknowledged', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69SSA4';
    const unitId = '01ARZ3NDEKTSV4RRFFQ69SSU4';
    const roleId = '01ARZ3NDEKTSV4RRFFQ69SSR4';
    await insertUnit(env.DB, { id: unitId, type: 'branch', code: 'ss-branch-4', name: 'x' });
    await insertRole(env.DB, { id: roleId, name: 'x', unitId });
    await insertPerson(env.DB, { id: personId, email: 'd@example.org', clerkUserId: 'clerk_d' });
    await insertTerm(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69SST4',
      personId,
      roleId,
      unitId,
      startDate: '2026-01-01',
    });
    await env.DB.batch([insertNoticeVersionStatement('01ARZ3NDEKTSV4RRFFQ69SSN4')]);
    await env.DB.batch([
      buildAcknowledgePrivacyNoticeStatement(env.DB, {
        personId,
        noticeVersionId: '01ARZ3NDEKTSV4RRFFQ69SSN4',
      }),
    ]);

    const state = await resolveSessionState(env.DB, session('clerk_d'));
    expect(state.status).toBe('active');
    expect(state.status === 'active' && state.context.personId).toBe(personId);
  });

  it('stops a system administrator whose session had no second factor, before the notice', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69SSA5';
    const unitId = '01ARZ3NDEKTSV4RRFFQ69SSU5';
    const roleId = '01ARZ3NDEKTSV4RRFFQ69SSR5';
    await insertUnit(env.DB, { id: unitId, type: 'national', code: 'ss-national-5', name: 'x' });
    await insertRole(env.DB, { id: roleId, name: 'x', unitId });
    await insertPerson(env.DB, { id: personId, email: 'e@example.org', clerkUserId: 'clerk_e' });
    await insertTerm(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69SST5',
      personId,
      roleId,
      unitId,
      startDate: '2026-01-01',
    });
    await insertSystemAdministrator(env.DB, personId);

    expect(await resolveSessionState(env.DB, session('clerk_e'))).toEqual({
      status: 'second-factor-required',
      personId,
    });
    expect((await resolveSessionState(env.DB, session('clerk_e', true))).status).toBe(
      'notice-not-acknowledged',
    );
  });

  it('stops the holder of a role the setting lists, and only once the setting lists it (T-100)', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69SSA6';
    const unitId = '01ARZ3NDEKTSV4RRFFQ69SSU6';
    const roleId = '01ARZ3NDEKTSV4RRFFQ69SSR6';
    await insertUnit(env.DB, { id: unitId, type: 'branch', code: 'ss-branch-6', name: 'x' });
    await insertRole(env.DB, { id: roleId, name: 'x', unitId });
    await insertPerson(env.DB, { id: personId, email: 'f@example.org', clerkUserId: 'clerk_f' });
    await insertTerm(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69SST6',
      personId,
      roleId,
      unitId,
      startDate: '2026-01-01',
    });
    const before = await resolveSessionState(env.DB, session('clerk_f'));

    await setSetting(env.DB, {
      key: 'committee-register.roles_requiring_mfa',
      value: [roleId],
      actorPersonId: personId,
    });

    expect(before.status).not.toBe('second-factor-required');
    expect(await resolveSessionState(env.DB, session('clerk_f'))).toEqual({
      status: 'second-factor-required',
      personId,
    });
    expect((await resolveSessionState(env.DB, session('clerk_f', true))).status).not.toBe(
      'second-factor-required',
    );
  });
});
