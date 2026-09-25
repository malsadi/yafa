import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppointAdministratorForm } from '../../../../../src/web/features/administration-panel/system-administrators/appoint-administrator-form';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const CANDIDATES = [{ personId: 'p3', name: 'Cara Example', email: 'cara.example@example.org' }];

async function choose(select: HTMLSelectElement, value: string) {
  await act(async () => {
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await Promise.resolve();
  });
}

describe('AppointAdministratorForm (brief 25 A1)', () => {
  it('appoints only once an officer is chosen', async () => {
    setBrowserLanguages(['en-GB']);
    const onAppoint = vi.fn();
    const container = await renderForTest(
      <AppointAdministratorForm candidates={CANDIDATES} busy={false} onAppoint={onAppoint} />,
    );
    const button = container.querySelector('button');
    const select = container.querySelector('select');

    expect(button?.disabled).toBe(true);
    if (select) await choose(select, 'p3');
    expect(button?.disabled).toBe(false);
    await act(async () => {
      button?.click();
      await Promise.resolve();
    });
    expect(onAppoint).toHaveBeenCalledWith('p3');
  });

  it('says so when no one can be appointed', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <AppointAdministratorForm candidates={[]} busy={false} onAppoint={vi.fn()} />,
    );

    expect(container.textContent).toBe('No one else holds a current General Council term.');
    expect(container.querySelector('form')).toBeNull();
  });
});
