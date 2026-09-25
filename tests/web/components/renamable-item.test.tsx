import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RenamableItem } from '../../../src/web/components/renamable-item';
import { renderForTest, setBrowserLanguages } from '../render-for-test';

const NAMES = { nameEn: 'Secretary', nameAr: 'السكرتير' };

describe('RenamableItem (D-052)', () => {
  it('shows the name in the officer language, with its note', async () => {
    setBrowserLanguages(['ar']);
    const container = await renderForTest(
      <ul>
        <RenamableItem names={NAMES} note="مسؤول سجل الفرع" busy={false} onRename={vi.fn()} />
      </ul>,
    );

    expect(container.querySelector('p')?.textContent).toBe('السكرتير · مسؤول سجل الفرع');
  });

  it('renames in both languages, then closes the form', async () => {
    setBrowserLanguages(['en-GB']);
    const onRename = vi.fn();
    const container = await renderForTest(
      <ul>
        <RenamableItem names={NAMES} busy={false} onRename={onRename} />
      </ul>,
    );
    await act(async () => {
      container.querySelector<HTMLElement>('button[aria-label="Rename Secretary"]')?.click();
      await Promise.resolve();
    });
    await act(async () => {
      container.querySelector('form')?.requestSubmit();
      await Promise.resolve();
    });

    expect(onRename).toHaveBeenCalledWith(NAMES);
    expect(container.querySelector('form')).toBeNull();
  });
});
