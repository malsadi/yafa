import { describe, expect, it, vi } from 'vitest';
import { ListSection } from '../../../../../src/web/features/administration-panel/lists/list-section';
import { ArchiveCategoriesSection } from '../../../../../src/web/features/administration-panel/lists/archive-categories-section';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

describe('ListSection (brief 25 B3)', () => {
  it('names the list, says when it is empty, and explains a refusal', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <ListSection
        list="meeting-types"
        items={[]}
        refusal="lists.name-taken"
        busy={false}
        onAdd={vi.fn()}
        onRename={vi.fn()}
      />,
    );

    expect(container.querySelector('h2')?.textContent).toBe('Meeting types');
    expect(container.textContent).toContain('No items yet.');
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(
      'Another item in this list already has this name.',
    );
  });

  it('lists items in the officer language, each renamable', async () => {
    setBrowserLanguages(['ar']);
    const container = await renderForTest(
      <ListSection
        list="event-types"
        items={[{ id: 'i1', list: 'event-types', nameEn: 'Festival', nameAr: 'مهرجان' }]}
        refusal={null}
        busy={false}
        onAdd={vi.fn()}
        onRename={vi.fn()}
      />,
    );

    expect(container.querySelector('li')?.textContent).toContain('مهرجان');
    expect(container.querySelector('li button')).not.toBeNull();
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
