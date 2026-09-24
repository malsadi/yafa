import { describe, expect, it } from 'vitest';
import { applyDocumentLanguage } from '../../../../src/web/app/language/apply-document-language';

describe('applyDocumentLanguage (brief section 8.5)', () => {
  it('sets right-to-left for Arabic and left-to-right for English on <html>', () => {
    const root = document.documentElement;

    applyDocumentLanguage(root, 'ar');
    expect([root.lang, root.dir]).toEqual(['ar', 'rtl']);

    applyDocumentLanguage(root, 'en');
    expect([root.lang, root.dir]).toEqual(['en', 'ltr']);
  });
});
