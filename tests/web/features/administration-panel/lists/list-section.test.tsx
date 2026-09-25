import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { ListItem } from '../../../../../src/shared/administration-panel/lists';
import { ArchiveCategoriesSection } from '../../../../../src/web/features/administration-panel/lists/archive-categories-section';
import { ListSection } from '../../../../../src/web/features/administration-panel/lists/list-section';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const item = (
  id: string,
  nameEn: string,
  nameAr: string,
  extra: Partial<ListItem> = {},
): ListItem => ({
  id,
  list: 'event-types',
  nameEn,
  nameAr,
  position: 1,
  retiredAt: null,
  colour: null,
  ...extra,
});

function render(
  items: ListItem[],
  handlers: {
    onOrder?: (itemIds: string[]) => void;
    onRetire?: (itemId: string) => void;
    onRestore?: (itemId: string) => void;
  } = {},
  refusal: string | null = null,
) {
  return renderForTest(
    <ListSection
      list={items[0]?.list ?? 'meeting-types'}
      items={items}
      refusal={refusal}
      busy={false}
      onAdd={vi.fn()}
      onRename={vi.fn()}
      onOrder={handlers.onOrder ?? vi.fn()}
      onRetire={handlers.onRetire ?? vi.fn()}
      onRestore={handlers.onRestore ?? vi.fn()}
    />,
  );
}

async function click(container: HTMLElement, selector: string) {
  await act(async () => {
    container.querySelector<HTMLElement>(selector)?.click();
    await Promise.resolve();
  });
}

describe('ListSection (brief 25 B3; D-070, D-071, D-076)', () => {
  it('names the list, says when it is empty, and explains a refusal', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await render([], {}, 'lists.name-taken');

    expect(container.querySelector('h2')?.textContent).toBe('Meeting types');
    expect(container.textContent).toContain('No items yet.');
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(
      'Another item in this list already has this name.',
    );
  });

  it('moves an item one place, and offers no move past either end (D-071)', async () => {
    setBrowserLanguages(['en-GB']);
    const onOrder = vi.fn();
    const container = await render(
      [item('a', 'Festival', 'مهرجان'), item('b', 'Lecture', 'محاضرة')],
      { onOrder },
    );

    expect(
      container.querySelector<HTMLButtonElement>('[aria-label="Move Festival up"]')?.disabled,
    ).toBe(true);
    expect(
      container.querySelector<HTMLButtonElement>('[aria-label="Move Lecture down"]')?.disabled,
    ).toBe(true);
    await click(container, '[aria-label="Move Lecture up"]');
    expect(onOrder).toHaveBeenCalledWith(['b', 'a']);
  });

  it('retires only after a second click, marks a retired item, and offers to bring it back (D-070, D-078)', async () => {
    setBrowserLanguages(['en-GB']);
    const onRetire = vi.fn();
    const container = await render(
      [item('a', 'Festival', 'مهرجان'), item('b', 'Trip', 'رحلة', { retiredAt: 'then' })],
      { onRetire },
    );

    await click(container, '[aria-label="Retire Festival"]');
    expect(onRetire).not.toHaveBeenCalled();
    expect(container.textContent).toContain('You can bring it back later.');
    await click(container, 'button.bg-slate-900');
    expect(onRetire).toHaveBeenCalledOnce();
    expect(container.querySelectorAll('li')[1]?.textContent).toContain('Retired');
    expect(container.querySelector('[aria-label="Retire Trip"]')).toBeNull();
    expect(container.querySelector('[aria-label="Bring back Trip"]')).not.toBeNull();
  });

  it('asks a calendar colour for its colour, and no other list (D-076)', async () => {
    setBrowserLanguages(['en-GB']);
    const colours = await render([
      item('c', 'Blue', 'أزرق', { list: 'calendar-colours', colour: '#1D4ED8' }),
    ]);
    expect(colours.querySelector('input[placeholder="#RRGGBB"]')).not.toBeNull();
    const events = await render([item('a', 'Festival', 'مهرجان')]);
    expect(events.querySelector('input[placeholder="#RRGGBB"]')).toBeNull();
  });
});

describe('ArchiveCategoriesSection (brief 25 B3, 13 A3)', () => {
  it('shows the categories as fixed, with nothing to change them', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <ArchiveCategoriesSection
        categories={[{ id: 'c1', nameEn: 'Events', nameAr: 'الفعاليات' }]}
      />,
    );

    expect(container.textContent).toContain('cannot be changed');
    expect(container.querySelectorAll('li')).toHaveLength(1);
    expect(container.querySelector('button, form')).toBeNull();
  });
});
