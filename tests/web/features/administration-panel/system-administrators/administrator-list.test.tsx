import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { SystemAdministratorListItem } from '../../../../../src/shared/administration-panel/system-administrators';
import { AdministratorList } from '../../../../../src/web/features/administration-panel/system-administrators/administrator-list';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const ADMINS: SystemAdministratorListItem[] = [
  {
    personId: 'p1',
    name: 'Ada Example',
    email: 'ada.example@example.org',
    appointedAt: '2026-09-24T10:00:00.000Z',
  },
  {
    personId: 'p2',
    name: 'Ben Example',
    email: 'ben.example@example.org',
    appointedAt: '2026-09-25T10:00:00.000Z',
  },
];

describe('AdministratorList (brief 25 A1, P21)', () => {
  it('lists each administrator with name, email and appointment date', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <AdministratorList administrators={ADMINS} canRemove busy={false} onRemove={vi.fn()} />,
    );
    const items = [...container.querySelectorAll('li')].map((li) => li.textContent);

    expect(items).toHaveLength(2);
    expect(items[0]).toContain('Ada Example');
    expect(items[0]).toContain('ada.example@example.org');
    expect(items[0]).toContain('24 September 2026');
  });

  it('removes the chosen administrator', async () => {
    setBrowserLanguages(['en-GB']);
    const onRemove = vi.fn();
    const container = await renderForTest(
      <AdministratorList administrators={ADMINS} canRemove busy={false} onRemove={onRemove} />,
    );
    const button = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === 'Remove Ben Example',
    );
    await act(async () => {
      button?.click();
      await Promise.resolve();
    });

    expect(onRemove).toHaveBeenCalledWith('p2');
  });

  it('offers no removal when only the minimum remain', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <AdministratorList
        administrators={ADMINS}
        canRemove={false}
        busy={false}
        onRemove={vi.fn()}
      />,
    );

    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
