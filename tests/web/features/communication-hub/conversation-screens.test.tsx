import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type {
  DiscussionSummary,
  HubMessage,
  HubRequestRecord,
} from '../../../../src/shared/communication-hub/conversation-records';
import { DiscussionInviteForm } from '../../../../src/web/features/communication-hub/discussion-invite-form';
import { HubMessageItem } from '../../../../src/web/features/communication-hub/hub-message-item';
import {
  emptyRequestDraft,
  sendRequestCall,
} from '../../../../src/web/features/communication-hub/request-draft';
import { RequestHeading } from '../../../../src/web/features/communication-hub/request-heading';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

vi.mock('@clerk/react', () => ({ useAuth: () => ({ getToken: () => Promise.resolve(null) }) }));
vi.stubGlobal(
  'fetch',
  vi.fn(() => Promise.resolve(new Response('[]', { status: 200 }))),
);

const withQueries = (element: ReactNode) => (
  <QueryClientProvider client={new QueryClient()}>{element}</QueryClientProvider>
);
const MESSAGE: HubMessage = {
  id: 'm1',
  authorName: 'Treasurer',
  authorUnitsEn: 'North',
  authorUnitsAr: 'الشمال',
  body: 'Year-end is close.',
  sentAt: '2026-10-01T09:00:00.000Z',
  removed: false,
  mine: true,
};
const DISCUSSION: DiscussionSummary = {
  id: 'd1',
  subject: 'Youth',
  startedByName: 'Chair',
  startedAt: '2026-10-01T09:00:00.000Z',
  startedByMe: true,
  members: [{ personId: 'p1', name: 'Chair' }],
};

describe('the conversation screens (brief 20 B1 to B3; D-159 to D-161)', () => {
  it('shows who wrote a message, from where — and a removed one as removed, with no text (D-161)', async () => {
    setBrowserLanguages(['en-GB']);
    const live = await renderForTest(withQueries(<HubMessageItem message={MESSAGE} />));
    expect(live.textContent).toContain('Treasurer (North)');
    expect(live.querySelector('button')?.textContent).toBe('Remove');
    const gone = await renderForTest(
      withQueries(<HubMessageItem message={{ ...MESSAGE, body: null, removed: true }} />),
    );
    expect(gone.textContent).toContain('Message removed by its author.');
    expect(gone.querySelector('button')).toBeNull();
  });

  it('says plainly on the invite screen that whoever is added sees everything said so far (D-159)', async () => {
    setBrowserLanguages(['ar']);
    const form = await renderForTest(
      withQueries(
        <DiscussionInviteForm unitId="u1" discussion={DISCUSSION} onDone={() => undefined} />,
      ),
    );
    expect(form.querySelector('[role="note"]')?.textContent).toContain(
      'سيرى كل ما قيل في هذا النقاش من قبل',
    );
  });

  it('sends a request to the chosen branches, and shows its status in the officer’s language (B3)', async () => {
    const draft = {
      ...emptyRequestDraft(),
      subject: 'Chairs',
      body: 'Fifty, please.',
      to: 'chosen' as const,
      unitIds: ['b2'],
    };
    expect(sendRequestCall('b1', draft).body).toEqual({
      subject: 'Chairs',
      body: 'Fifty, please.',
      toAllBranches: false,
      unitIds: ['b2'],
    });
    setBrowserLanguages(['ar']);
    const request: HubRequestRecord = {
      id: 'r1',
      direction: 'received',
      fromUnitId: 'b1',
      fromUnitNameEn: 'North',
      fromUnitNameAr: 'الشمال',
      subject: 'Chairs',
      body: 'Fifty, please.',
      toAllBranches: false,
      status: 'Answered',
      createdByName: 'Secretary',
      createdAt: '2026-10-01T09:00:00.000Z',
      recipients: [{ unitId: 'b2', nameEn: 'South', nameAr: 'الجنوب' }],
    };
    const heading = await renderForTest(<RequestHeading request={request} />);
    expect(heading.textContent).toContain('تمت الإجابة');
    expect(heading.textContent).toContain('من الشمال');
    expect(heading.textContent).toContain('إلى: الجنوب');
  });
});
