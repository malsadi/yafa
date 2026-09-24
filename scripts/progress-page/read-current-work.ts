import type { Bilingual } from './bilingual.ts';

export interface CurrentWork {
  /** "YYYY-MM-DD HH:MM", UK time, stamped by the pre-commit hook. */
  updated: string;
  now: Bilingual;
}

const START = '<!-- current-work:start -->';
const END = '<!-- current-work:end -->';

/** The live status block in `docs/current-work.md` (D-057, D-058). */
export function readCurrentWork(file: string): CurrentWork {
  const start = file.indexOf(START);
  const end = file.indexOf(END);
  if (start === -1 || end === -1) {
    throw new Error('docs/current-work.md has no current-work block');
  }
  const lines = file
    .slice(start + START.length, end)
    .split('\n')
    .map((line) => line.trim());
  const value = (label: string) =>
    lines
      .find((line) => line.startsWith(label))
      ?.slice(label.length)
      .trim() ?? '';
  const work = { updated: value('Updated:'), now: { en: value('Now:'), ar: value('Now (ar):') } };
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(work.updated) || !work.now.en || !work.now.ar) {
    throw new Error(
      'docs/current-work.md needs "Updated: YYYY-MM-DD HH:MM", "Now:" and "Now (ar):"',
    );
  }
  return work;
}
