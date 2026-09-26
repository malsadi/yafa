import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AddFieldForm } from '../../../../src/web/features/resources-library/add-field-form';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

async function typeName(container: HTMLElement, value: string) {
  const input = container.querySelector('input');
  await act(async () => {
    if (input) {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await Promise.resolve();
  });
  return container.querySelector('button');
}

describe('naming a letter template field (D-101)', () => {
  it('adds a new name, trimmed, and refuses one already listed or with braces', async () => {
    setBrowserLanguages(['en-GB']);
    const onAdd = vi.fn();
    const container = await renderForTest(<AddFieldForm fields={['venue']} onAdd={onAdd} />);
    expect((await typeName(container, 'venue'))?.disabled).toBe(true);
    expect((await typeName(container, 'a{b'))?.disabled).toBe(true);
    const button = await typeName(container, '  contact ');
    expect(button?.disabled).toBe(false);
    await act(async () => {
      button?.click();
      await Promise.resolve();
    });
    expect(onAdd).toHaveBeenCalledWith('contact');
  });
});
