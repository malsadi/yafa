import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { InboxItem } from '../../../../src/shared/core/inbox';
import { AlertChoicesForm } from '../../../../src/web/features/communication-hub/alert-choices-form';
import { DevicePushPanel } from '../../../../src/web/features/communication-hub/device-push-panel';
import { useNotificationWords } from '../../../../src/web/features/inbox/use-notification-words';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

vi.mock('@clerk/react', () => ({ useAuth: () => ({ getToken: () => Promise.resolve(null) }) }));

const withQueries = (element: ReactNode) => (
  <QueryClientProvider client={new QueryClient()}>{element}</QueryClientProvider>
);

const NOTICE: InboxItem = {
  id: 'n1',
  kind: 'communication-hub.notice',
  params: { title: 'Hall', unitEn: 'North', unitAr: 'الشمال' },
  readAt: null,
  createdAt: '2026-10-01T09:00:00.000Z',
};

function Words(props: { item: InboxItem }) {
  return <p>{useNotificationWords()(props.item)}</p>;
}

describe('alert settings and alert words (brief 20 C1, C2; D-162, D-163)', () => {
  it('offers each alert type, with national circulars always on, and says when the starting alerts apply', async () => {
    setBrowserLanguages(['en-GB']);
    const form = await renderForTest(
      withQueries(<AlertChoicesForm view={{ alertTypes: ['notices'], chosen: false }} />),
    );
    const boxes = [...form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    expect(boxes.map((b) => [b.parentElement?.textContent, b.checked, b.disabled])).toEqual([
      ['New notices', true, false],
      ['Votes', false, false],
      ['Replies', false, false],
      ['Requests', false, false],
      ['National circulars (always on)', true, true],
    ]);
    expect(form.textContent).toContain('you get the alerts new officers start with');
  });

  it('says phone alerts are not set up while the portal has no push key', async () => {
    setBrowserLanguages(['en-GB']);
    const panel = await renderForTest(
      withQueries(<DevicePushPanel setup={{ publicKey: null, installGuide: null }} />),
    );
    expect(panel.textContent).toContain('Phone alerts are not set up yet.');
  });

  it("gives a notification's unit in the reader's language", async () => {
    setBrowserLanguages(['ar']);
    expect((await renderForTest(<Words item={NOTICE} />)).textContent).toBe(
      'إعلان جديد في الشمال: «Hall».',
    );
    setBrowserLanguages(['en-GB']);
    expect((await renderForTest(<Words item={NOTICE} />)).textContent).toBe(
      'New notice in North: "Hall".',
    );
  });
});
