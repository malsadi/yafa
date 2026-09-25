import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AdminTextForm } from '../../../../../src/web/features/administration-panel/admin-texts/admin-text-form';
import { AlertTypesForm } from '../../../../../src/web/features/administration-panel/notifications/alert-types-form';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

async function submit(container: HTMLElement) {
  await act(async () => {
    container.querySelector('form')?.requestSubmit();
    await Promise.resolve();
  });
}

describe('notification forms (brief 25 C4, 20 C1; D-022)', () => {
  it('ticks nothing while not set, keeps circulars always on, and saves the chosen alerts', async () => {
    setBrowserLanguages(['en-GB']);
    const onSave = vi.fn();
    const container = await renderForTest(
      <AlertTypesForm chosen={null} busy={false} onSave={onSave} />,
    );
    const boxes = [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];

    expect(boxes.map((b) => b.parentElement?.textContent)).toEqual([
      'National circulars (always on)',
      'New notices',
      'Votes',
      'Replies',
      'Requests',
    ]);
    expect(boxes[0]?.disabled).toBe(true);
    expect(boxes.slice(1).some((b) => b.checked)).toBe(false);
    await act(async () => {
      boxes[2]?.click();
      await Promise.resolve();
    });
    await submit(container);
    expect(onSave).toHaveBeenCalledWith(['votes']);
  });

  it('saves an Arabic text left empty as not yet written, and says English shows meanwhile', async () => {
    setBrowserLanguages(['en-GB']);
    const onSave = vi.fn();
    const container = await renderForTest(
      <AdminTextForm
        text={{ key: 'iphone-install-guide', textEn: 'Add it to your home screen.', textAr: null }}
        busy={false}
        onSave={onSave}
      />,
    );

    expect(container.textContent).toContain('officers reading Arabic see the English');
    await submit(container);
    expect(onSave).toHaveBeenCalledWith({ textEn: 'Add it to your home screen.', textAr: null });
  });
});
