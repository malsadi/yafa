import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { UnitForm } from '../../../../../src/web/features/administration-panel/units/unit-form';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const BRANCH = {
  code: 'EX',
  nameEn: 'Example Branch',
  nameAr: 'فرع المثال',
  area: 'North',
  status: 'active',
} as const;

async function submit(container: HTMLElement) {
  await act(async () => {
    container.querySelector('form')?.requestSubmit();
    await Promise.resolve();
  });
}

describe('UnitForm (brief 14 A1, 25 B1)', () => {
  it('sends a branch with its area and status', async () => {
    setBrowserLanguages(['en-GB']);
    const onSubmit = vi.fn();
    const container = await renderForTest(
      <UnitForm
        initial={BRANCH}
        isNational={false}
        busy={false}
        submitLabel="Save"
        onSubmit={onSubmit}
      />,
    );
    await submit(container);

    expect(onSubmit).toHaveBeenCalledWith(BRANCH);
  });

  it('never offers or sends an area or status for the General Council', async () => {
    setBrowserLanguages(['en-GB']);
    const onSubmit = vi.fn();
    const container = await renderForTest(
      <UnitForm initial={BRANCH} isNational busy={false} submitLabel="Save" onSubmit={onSubmit} />,
    );
    await submit(container);

    expect(container.querySelector('select')).toBeNull();
    expect(container.querySelectorAll('input')).toHaveLength(3);
    expect(onSubmit).toHaveBeenCalledWith({
      code: 'EX',
      nameEn: 'Example Branch',
      nameAr: 'فرع المثال',
    });
  });

  it('leaves a new branch status unchosen', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <UnitForm
        initial={{ ...BRANCH, status: '' }}
        isNational={false}
        busy={false}
        submitLabel="Add"
        onSubmit={vi.fn()}
      />,
    );

    expect(container.querySelector('select')?.value).toBe('');
  });
});
