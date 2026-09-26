import { describe, expect, it } from 'vitest';
import type { InboxItem } from '../../../../src/shared/core/inbox';
import { useNotificationWords } from '../../../../src/web/features/inbox/use-notification-words';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

const item = (kind: string): InboxItem => ({
  id: 'n',
  kind,
  params: { title: 'Book hall', dueDate: '2026-10-13' },
  readAt: null,
  createdAt: 'x',
});

function Words({ kind }: { kind: string }) {
  return <>{useNotificationWords()(item(kind))}</>;
}

describe('a notification in the officer’s words (brief 9.5, 18 B3)', () => {
  it('writes a task reminder with its date, in the officer’s language', async () => {
    setBrowserLanguages(['en-GB']);
    expect((await renderForTest(<Words kind="task-tracker.due-soon" />)).textContent).toBe(
      'Reminder: "Book hall" is due on 13 October 2026.',
    );
    expect((await renderForTest(<Words kind="task-tracker.overdue" />)).textContent).toBe(
      '"Book hall" was due on 13 October 2026 and is overdue.',
    );
  });

  it('shows a kind it does not know plainly', async () => {
    setBrowserLanguages(['en-GB']);
    expect((await renderForTest(<Words kind="something.else" />)).textContent).toBe(
      'A notification.',
    );
  });
});
