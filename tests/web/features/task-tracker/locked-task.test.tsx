import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { TaskRecord } from '../../../../src/shared/task-tracker/task-records';
import {
  ActiveSessionContext,
  type ActiveSession,
} from '../../../../src/web/app/session/active-session-context';
import { TaskItem } from '../../../../src/web/features/task-tracker/task-item';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

vi.mock('@clerk/react', () => ({ useAuth: () => ({ getToken: () => Promise.resolve(null) }) }));

// D-184 and brief 28: a closed event's task is locked — clearly marked, with
// no status choice and no edit control, even for its owner or a manager.
const SESSION: ActiveSession = {
  status: 'active',
  language: 'en',
  context: { personId: 'p1', units: [], roles: [], capabilities: [], isSystemAdmin: false },
  units: [],
  maintenanceMode: false,
  photoMaxDimensionPx: null,
};

const task = (locked: boolean): TaskRecord => ({
  id: 't1',
  unitId: 'u1',
  unitNameEn: 'North',
  unitNameAr: 'الشمال',
  eventId: 'e1',
  eventName: 'Fete',
  title: 'Book hall',
  description: null,
  ownerPersonId: 'p1',
  ownerName: 'Owner',
  dueDate: '2026-10-01',
  status: 'Done',
  version: 2,
  dueSoon: false,
  overdue: false,
  locked,
});

const renderTask = (locked: boolean) =>
  renderForTest(
    <QueryClientProvider client={new QueryClient()}>
      <ActiveSessionContext.Provider value={SESSION}>
        <TaskItem task={task(locked)} showUnit={false} manages />
      </ActiveSessionContext.Provider>
    </QueryClientProvider>,
  );

describe('a locked task (D-184; brief 28)', () => {
  it('offers its owner and a manager the status and edit controls while open', async () => {
    setBrowserLanguages(['en-GB']);
    const open = await renderTask(false);
    expect(open.querySelector('select')).not.toBeNull();
    expect(open.textContent).toContain('Change');
    expect(open.textContent).not.toContain('Locked');
  });

  it('is marked locked, with no status choice or edit, in English and Arabic', async () => {
    setBrowserLanguages(['en-GB']);
    const english = await renderTask(true);
    expect(english.querySelector('select')).toBeNull();
    expect(english.textContent).toContain('Locked: its event is closed.');
    expect(english.textContent).not.toContain('Change');
    setBrowserLanguages(['ar']);
    const arabic = await renderTask(true);
    expect(arabic.querySelector('select')).toBeNull();
    expect(arabic.textContent).toContain('مقفلة: فعاليتها مغلقة.');
  });
});
