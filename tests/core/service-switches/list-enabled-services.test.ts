import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { listEnabledServices, setServiceSwitch } from '../../../src/worker/core/service-switches';

const ACTOR = '01ARZ3NDEKTSV4RRFFQ69G5LA1';
const BRANCH_A = '01ARZ3NDEKTSV4RRFFQ69G5LA2';
const BRANCH_B = '01ARZ3NDEKTSV4RRFFQ69G5LA3';

describe('listEnabledServices', () => {
  it('lists only the three services that cannot be switched off when nothing is set', async () => {
    expect(await listEnabledServices(env.DB, BRANCH_A)).toEqual([
      'committee-register',
      'documents-archive',
      'administration-panel',
    ]);
  });

  it('includes a portal-wide switch, in brief section 3.1 order', async () => {
    await setServiceSwitch(env.DB, {
      service: 'task-tracker',
      enabled: true,
      actorPersonId: ACTOR,
    });
    await setServiceSwitch(env.DB, { service: 'treasury', enabled: true, actorPersonId: ACTOR });

    expect(await listEnabledServices(env.DB, BRANCH_A)).toEqual([
      'treasury',
      'committee-register',
      'task-tracker',
      'documents-archive',
      'administration-panel',
    ]);
  });

  it('lets a unit override win over the portal-wide value, for that unit only', async () => {
    await setServiceSwitch(env.DB, { service: 'calendar', enabled: true, actorPersonId: ACTOR });
    await setServiceSwitch(env.DB, {
      service: 'calendar',
      enabled: false,
      unitId: BRANCH_A,
      actorPersonId: ACTOR,
    });

    expect(await listEnabledServices(env.DB, BRANCH_A)).not.toContain('calendar');
    expect(await listEnabledServices(env.DB, BRANCH_B)).toContain('calendar');
  });
});
