import type { Bilingual } from './bilingual.ts';

const START = '<!-- progress-text:start -->';
const END = '<!-- progress-text:end -->';

export type ProgressText = Record<string, Bilingual>;

/** The page's wording in both languages, from `docs/progress-page-text.md`. */
export function readProgressText(file: string): ProgressText {
  const start = file.indexOf(START);
  const end = file.indexOf(END);
  if (start === -1 || end === -1) {
    throw new Error('docs/progress-page-text.md has no progress-text block');
  }
  const text: ProgressText = {};
  for (const line of file.slice(start + START.length, end).split('\n')) {
    const cells = line.split('|').map((cell) => cell.trim());
    const [, key, en, ar] = cells;
    if (!key || key === 'Key' || key.startsWith('---') || !en || !ar) continue;
    text[key] = { en, ar };
  }
  return text;
}

/** One entry, or a clear error naming the missing key. */
export function entry(text: ProgressText, key: string): Bilingual {
  const found = text[key];
  if (!found) {
    throw new Error(`docs/progress-page-text.md has no "${key}"`);
  }
  return found;
}
