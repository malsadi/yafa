import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ArchiveSearchForm } from '../../../../src/web/features/documents-archive/archive-search-form';
import { ArchiveUploadFields } from '../../../../src/web/features/documents-archive/archive-upload-fields';
import { EMPTY_SEARCH } from '../../../../src/web/features/documents-archive/archive.api';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

const CATEGORIES = [
  { id: 'events', nameEn: 'Events', nameAr: 'الفعاليات' },
  { id: 'governance', nameEn: 'Governance', nameAr: 'الحوكمة' },
  { id: 'general', nameEn: 'General', nameAr: 'عام' },
];

function optionsOf(container: HTMLElement, label: string): string[] {
  const field = [...container.querySelectorAll('label')].find((l) =>
    l.textContent.startsWith(label),
  );
  return [...(field?.querySelectorAll('option') ?? [])].map((o) => o.textContent);
}

describe('the archive forms (brief 15 A2, B1; D-096, D-097)', () => {
  it('offers only Governance and General for an upload', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <ArchiveUploadFields
        details={{ categoryId: '', title: '', description: '', documentDate: '' }}
        set={() => vi.fn()}
        categories={CATEGORIES}
        onFile={vi.fn()}
      />,
    );
    expect(optionsOf(container, 'Category')).toEqual(['', 'Governance', 'General']);
  });

  it('asks for a date range only once the date to search by is chosen, and searches with it', async () => {
    setBrowserLanguages(['en-GB']);
    const onSearch = vi.fn();
    const container = await renderForTest(
      <ArchiveSearchForm
        initial={EMPTY_SEARCH}
        categories={CATEGORIES}
        units={[]}
        onSearch={onSearch}
      />,
    );
    expect(container.querySelectorAll('input[type="date"]')).toHaveLength(0);
    const dateSelect = [...container.querySelectorAll('select')][2];
    await act(async () => {
      if (dateSelect) {
        dateSelect.value = 'filed';
        dateSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await Promise.resolve();
    });
    expect(container.querySelectorAll('input[type="date"]')).toHaveLength(2);
    await act(async () => {
      container.querySelector('form')?.requestSubmit();
      await Promise.resolve();
    });
    expect(onSearch).toHaveBeenCalledWith({ ...EMPTY_SEARCH, dateField: 'filed' });
  });
});
