import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { MatrixVersionSummary } from '../../../../../src/shared/administration-panel/permissions-matrix';
import { MatrixHistory } from '../../../../../src/web/features/administration-panel/permissions-matrix/matrix-history';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const VERSIONS: MatrixVersionSummary[] = [
  {
    number: 1,
    createdAt: '2026-09-24T10:00:00.000Z',
    createdByEmail: 'ada.example@example.org',
    change: {
      kind: 'cell',
      roleId: 'r1',
      capability: 'committee-register.register.read',
      before: [],
      after: ['own unit'],
    },
  },
  {
    number: 2,
    createdAt: '2026-09-24T11:00:00.000Z',
    createdByEmail: 'ada.example@example.org',
    change: { kind: 'restore', fromVersion: 1 },
  },
];

describe('MatrixHistory (brief 25 A3, T-079)', () => {
  it('lists versions newest first, and restores any but the current one', async () => {
    setBrowserLanguages(['en-GB']);
    const onRestore = vi.fn();
    const container = await renderForTest(
      <MatrixHistory
        versions={VERSIONS}
        roles={[{ id: 'r1', unitId: null, nameEn: 'Chair', nameAr: 'الرئيس', designation: null }]}
        currentVersion={2}
        busy={false}
        onRestore={onRestore}
      />,
    );
    const items = [...container.querySelectorAll('li')].map((li) => li.textContent);

    expect(items[0]).toContain('Restored version 1');
    expect(items[0]).toContain('Current version');
    expect(items[1]).toContain('Changed Read the register for Chair');
    expect(items[1]).toContain('24 September 2026');
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    await act(async () => {
      buttons[0]?.click();
      await Promise.resolve();
    });
    expect(onRestore).toHaveBeenCalledWith(1);
  });
});
