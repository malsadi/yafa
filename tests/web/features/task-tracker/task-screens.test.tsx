import { describe, expect, it } from 'vitest';
import type { TaskRecord } from '../../../../src/shared/task-tracker/task-records';
import {
  draftOf,
  ownerChoices,
  saveRequest,
} from '../../../../src/web/features/task-tracker/task-draft';
import { TaskFlagBadges } from '../../../../src/web/features/task-tracker/task-flag-badges';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

const TASK: TaskRecord = {
  id: 't1',
  unitId: 'u1',
  unitNameEn: 'North',
  unitNameAr: 'الشمال',
  eventId: null,
  title: 'Book hall',
  description: null,
  ownerPersonId: 'p-old',
  ownerName: 'Former Officer',
  dueDate: '2026-10-01',
  status: 'In progress',
  version: 3,
  dueSoon: false,
  overdue: true,
};

describe('the Task tracker screens (brief 18; D-138, D-139)', () => {
  it('highlights overdue and due soon, in the officer’s language', async () => {
    setBrowserLanguages(['ar']);
    expect(
      (await renderForTest(<TaskFlagBadges task={{ dueSoon: false, overdue: true }} />))
        .textContent,
    ).toBe('متأخرة');
    setBrowserLanguages(['en-GB']);
    expect(
      (await renderForTest(<TaskFlagBadges task={{ dueSoon: true, overdue: false }} />))
        .textContent,
    ).toBe('Due soon');
  });

  it('adds a new task as To do, and changes one from the version read, status included', () => {
    const fresh = { ...draftOf(), title: 'New', ownerPersonId: 'p1', dueDate: '2026-11-01' };
    expect(saveRequest('u1', fresh)).toEqual({
      path: '/api/task-tracker/units/u1/tasks',
      method: 'POST',
      body: { title: 'New', description: '', ownerPersonId: 'p1', dueDate: '2026-11-01' },
    });
    expect(saveRequest('u1', { ...draftOf(TASK), status: 'Done' }, TASK)).toMatchObject({
      path: '/api/task-tracker/units/u1/tasks/t1',
      method: 'PUT',
      body: { version: 3, task: { status: 'Done', title: 'Book hall' } },
    });
  });

  it('keeps offering a task’s owner who is no longer a current officer', () => {
    expect(ownerChoices([{ personId: 'p1', name: 'Current' }], TASK).map((o) => o.name)).toEqual([
      'Current',
      'Former Officer',
    ]);
    expect(ownerChoices([{ personId: 'p1', name: 'Current' }])).toHaveLength(1);
  });
});
