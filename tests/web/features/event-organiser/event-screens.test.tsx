import { describe, expect, it } from 'vitest';
import type { EventSummary } from '../../../../src/shared/event-organiser/event-records';
import { CloseBalance } from '../../../../src/web/features/event-organiser/close-balance';
import {
  changeRequest,
  createRequest,
  eventDraftOf,
} from '../../../../src/web/features/event-organiser/event-draft';
import { fileUseOf } from '../../../../src/web/features/event-organiser/event-file-upload';
import { EventProgress } from '../../../../src/web/features/event-organiser/event-progress';
import { eventTaskRequest } from '../../../../src/web/features/event-organiser/event-task-request';
import {
  templateBodyOf,
  templateDraftOf,
} from '../../../../src/web/features/event-organiser/template-draft';
import { draftOf } from '../../../../src/web/features/task-tracker/task-draft';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

const EVENT: EventSummary = {
  id: 'e1',
  unitId: 'u1',
  name: 'Fete',
  typeItemId: 'type-1',
  typeNameEn: 'Fete',
  typeNameAr: 'مهرجان',
  leadPersonId: 'p1',
  leadName: 'Lead',
  firstDay: '2099-06-20',
  startTime: null,
  lastDay: null,
  status: 'Draft',
  createdBy: 'p2',
  approvedBy: null,
  approvedAt: null,
  cancelReason: null,
  cancelledAt: null,
  calendarPublishedAt: null,
  noticeboardPublishedAt: null,
  cancellationPostedAt: null,
  closedAt: null,
  version: 4,
};

describe('the Event organiser screens (brief 21)', () => {
  it('creates an event from a template, and changes one from the version read (A1, A3; D-176)', () => {
    const draft = {
      ...eventDraftOf(),
      name: 'Gala',
      typeItemId: 't',
      leadPersonId: 'p',
      firstDay: '2099-01-02',
    };
    expect(createRequest('u1', draft, 'tpl')).toEqual({
      path: '/api/event-organiser/units/u1/events',
      method: 'POST',
      body: {
        event: {
          name: 'Gala',
          typeItemId: 't',
          leadPersonId: 'p',
          firstDay: '2099-01-02',
          startTime: null,
          lastDay: null,
        },
        templateId: 'tpl',
      },
    });
    expect(createRequest('u1', draft, '').body.templateId).toBeNull();
    expect(changeRequest(EVENT, eventDraftOf(EVENT))).toMatchObject({
      path: '/api/event-organiser/units/u1/events/e1',
      method: 'PUT',
      body: { version: 4 },
    });
  });

  it('removes an event task by cancelling it, through the event (B1; D-179)', () => {
    const task = {
      id: 't1',
      title: 'Hall',
      description: null,
      ownerPersonId: 'p1',
      dueDate: '2099-06-01',
      status: 'To do',
      version: 2,
    };
    const request = eventTaskRequest(
      EVENT,
      { ...draftOf(task as never), status: 'Cancelled' },
      task as never,
    );
    expect(request).toMatchObject({
      path: '/api/event-organiser/units/u1/events/e1/tasks/t1',
      method: 'PUT',
      body: { version: 2, task: { status: 'Cancelled' } },
    });
  });

  it('keeps template amounts in whole pence, and refuses one that does not read (D-178; build rule 3)', () => {
    const draft = {
      ...templateDraftOf(),
      name: 'Fete',
      tasks: [{ title: 'Book', description: '', daysBefore: '14' }],
      budgetLines: [{ name: 'Hall', amount: '150.5' }],
    };
    expect(templateBodyOf(draft)).toEqual({
      name: 'Fete',
      tasks: [{ title: 'Book', description: '', daysBefore: 14 }],
      budgetLines: [{ name: 'Hall', amountPence: 15050 }],
    });
    expect(
      templateBodyOf({ ...draft, budgetLines: [{ name: 'Hall', amount: '1,50' }] }),
    ).toBeNull();
    expect(
      templateBodyOf({ ...draft, tasks: [{ title: 'Book', description: '', daysBefore: '1.5' }] }),
    ).toBeNull();
  });

  it('files a photo or video in Media, anything else as a document (F1, F2)', () => {
    expect(fileUseOf('Documents', 'image/jpeg')).toBe('documents');
    expect(fileUseOf('Media', 'image/jpeg')).toBe('media-images');
    expect(fileUseOf('Media', 'video/mp4')).toBe('video');
  });

  it('shows progress and overdue tasks, and warns clearly of an overspend, in the officer’s language', async () => {
    setBrowserLanguages(['en-GB']);
    expect(
      (await renderForTest(<EventProgress progress={{ done: 1, total: 3, overdue: 2 }} />))
        .textContent,
    ).toBe('1 of 3 tasks done2 overdue');
    const overspent = await renderForTest(<CloseBalance balancePence={-400} />);
    expect(overspent.querySelector('[role="alert"]')?.textContent).toContain('overspent by £4.00');
    setBrowserLanguages(['ar']);
    expect((await renderForTest(<CloseBalance balancePence={2500} />)).textContent).toContain(
      'يعيد الإغلاق',
    );
  });
});
