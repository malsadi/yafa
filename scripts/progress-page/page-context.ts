import type { PageLanguage } from './bilingual.ts';
import { escapeHtml } from './escape-html.ts';
import { entry, type ProgressText } from './read-progress-text.ts';

export interface PageContext {
  language: PageLanguage;
  /** The escaped text for `key`, with `{name}` placeholders filled in. */
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function createPageContext(language: PageLanguage, text: ProgressText): PageContext {
  return {
    language,
    t: (key, values = {}) =>
      escapeHtml(entry(text, key)[language]).replace(/\{(\w+)\}/g, (match, name: string) =>
        name in values ? escapeHtml(String(values[name])) : match,
      ),
  };
}
