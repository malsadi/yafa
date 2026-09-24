export interface CurrentWork {
  /** "YYYY-MM-DD HH:MM", UK time, stamped by the pre-commit hook. */
  updated: string;
  now: string;
}

const START = '<!-- current-work:start -->';
const END = '<!-- current-work:end -->';

/** The live status block in `docs/current-work.md` (D-057). */
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
  const work = { updated: value('Updated:'), now: value('Now:') };
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(work.updated) || !work.now) {
    throw new Error('docs/current-work.md needs "Updated: YYYY-MM-DD HH:MM" and a "Now:" line');
  }
  return work;
}
