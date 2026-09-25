import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { SettingInput } from '../../../../../src/shared/administration-panel/setting-input';
import { RequiredSettingForm } from '../../../../../src/web/features/administration-panel/setup-checklist/required-setting-form';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

async function saveWith(input: SettingInput, entered: string, settingKey = 'x.y') {
  setBrowserLanguages(['en-GB']);
  const onSave = vi.fn();
  const container = await renderForTest(
    <RequiredSettingForm
      settingKey={settingKey}
      input={input}
      label="L"
      busy={false}
      onSave={onSave}
    />,
  );
  const field = container.querySelector<HTMLInputElement | HTMLSelectElement>('select, input');
  await act(async () => {
    if (field instanceof HTMLSelectElement) {
      field.value = entered;
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (field) {
      // React tracks an input's value: set it through the native setter.
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
        field,
        entered,
      );
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await Promise.resolve();
  });
  await act(async () => {
    container.querySelector('form')?.requestSubmit();
    await Promise.resolve();
  });
  return { container, onSave };
}

describe('RequiredSettingForm (brief 25 C6, D-074)', () => {
  it('names each choice, preselects none, and saves the chosen option', async () => {
    const { container, onSave } = await saveWith(
      { kind: 'choice', options: ['en', 'ar'] },
      'ar',
      'administration-panel.new_officer_language',
    );

    expect([...container.querySelectorAll('option')].map((o) => o.textContent)).toEqual([
      'Choose',
      'English',
      'Arabic',
    ]);
    expect(onSave).toHaveBeenCalledWith('ar');
  });

  it('saves yes or no as true or false, and a whole number as a number', async () => {
    expect((await saveWith({ kind: 'yes-no' }, 'false')).onSave).toHaveBeenCalledWith(false);
    expect((await saveWith({ kind: 'whole-number' }, '30')).onSave).toHaveBeenCalledWith(30);
  });

  it('offers nothing for a setting of another shape', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <RequiredSettingForm
        settingKey="x.y"
        input={{ kind: 'other' }}
        label="L"
        busy={false}
        onSave={vi.fn()}
      />,
    );
    expect(container.querySelector('form')).toBeNull();
  });
});
