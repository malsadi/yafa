import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  UnitForm,
  type UnitFormState,
} from '../../../../../src/web/features/administration-panel/units/unit-form';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

vi.mock('@clerk/react', () => ({ useAuth: () => ({ getToken: () => Promise.resolve(null) }) }));

const BRANCH: UnitFormState = {
  code: 'EX',
  nameEn: 'Example Branch',
  nameAr: 'فرع المثال',
  area: 'North',
  status: 'active',
  letterheadAddressEn: '1 Example Street',
  letterheadAddressAr: '',
  calendarColourId: '',
};

// The calendar colour choices are fetched; none are offered here.
vi.stubGlobal(
  'fetch',
  vi.fn(() => Promise.resolve(new Response('[]', { status: 200 }))),
);

function withQueries(element: ReactNode) {
  return <QueryClientProvider client={new QueryClient()}>{element}</QueryClientProvider>;
}

async function submit(container: HTMLElement) {
  await act(async () => {
    container.querySelector('form')?.requestSubmit();
    await Promise.resolve();
  });
}

describe('UnitForm (brief 14 A1, 25 B1; D-076)', () => {
  it('sends a branch with its area and status, and details not entered as null', async () => {
    setBrowserLanguages(['en-GB']);
    const onSubmit = vi.fn();
    const container = await renderForTest(
      withQueries(
        <UnitForm
          initial={BRANCH}
          isNational={false}
          busy={false}
          submitLabel="Save"
          onSubmit={onSubmit}
        />,
      ),
    );
    await submit(container);

    expect(onSubmit).toHaveBeenCalledWith({
      code: 'EX',
      nameEn: 'Example Branch',
      nameAr: 'فرع المثال',
      area: 'North',
      status: 'active',
      letterheadAddressEn: '1 Example Street',
      letterheadAddressAr: null,
      calendarColourId: null,
    });
  });

  it('never offers or sends an area or status for the General Council, but keeps its letterhead and colour', async () => {
    setBrowserLanguages(['en-GB']);
    const onSubmit = vi.fn();
    const container = await renderForTest(
      withQueries(
        <UnitForm
          initial={BRANCH}
          isNational
          busy={false}
          submitLabel="Save"
          onSubmit={onSubmit}
        />,
      ),
    );
    await submit(container);

    expect(container.textContent).not.toContain('Status');
    expect(container.textContent).not.toContain('Area');
    expect(container.textContent).toContain('Letterhead address in Arabic');
    expect(container.textContent).toContain('Calendar colour');
    expect(onSubmit).toHaveBeenCalledWith({
      code: 'EX',
      nameEn: 'Example Branch',
      nameAr: 'فرع المثال',
      letterheadAddressEn: '1 Example Street',
      letterheadAddressAr: null,
      calendarColourId: null,
    });
  });

  it('leaves a new branch status unchosen', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      withQueries(
        <UnitForm
          initial={{ ...BRANCH, status: '' }}
          isNational={false}
          busy={false}
          submitLabel="Add"
          onSubmit={vi.fn()}
        />,
      ),
    );

    expect(container.querySelector<HTMLSelectElement>('select[required]')?.value).toBe('');
  });
});
