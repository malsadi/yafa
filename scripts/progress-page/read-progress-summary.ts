import { splitBilingual, type Bilingual } from './bilingual.ts';

export interface ProgressSummary {
  summary: Bilingual;
  started: string;
  completed: string;
  lastUpdated: string;
  built: Bilingual[];
  left: Bilingual[];
  pending: PendingItem[];
}

/** A pending item in plain words; `reference` is an internal link, never shown. */
export interface PendingItem {
  text: Bilingual;
  reference: string | null;
}

type ListField = 'built' | 'left' | 'pending';

const START = '<!-- progress:start -->';
const END = '<!-- progress:end -->';
const LISTS: Record<string, ListField> = {
  'Built:': 'built',
  'Left:': 'left',
  'Pending:': 'pending',
};

function readPendingItem(line: string): PendingItem {
  const match = /^(.*?)\s*\{([A-Z]-\d+)\}$/.exec(line);
  const words = match ? (match[1] ?? '') : line;
  return { text: splitBilingual(words, 'A pending item'), reference: match?.[2] ?? null };
}

function lineValue(lines: string[], label: string): string {
  return (
    lines
      .find((line) => line.startsWith(label))
      ?.slice(label.length)
      .trim() ?? ''
  );
}

/**
 * The public progress summary a phase report carries between the
 * `progress:start`/`progress:end` markers (D-040, D-056, D-058): each line
 * and item in English and Arabic. Null for a report with no block.
 */
export function readProgressSummary(report: string): ProgressSummary | null {
  const start = report.indexOf(START);
  const end = report.indexOf(END);
  if (start === -1 || end === -1) return null;
  const lines = report
    .slice(start + START.length, end)
    .split('\n')
    .map((l) => l.trim());
  const summary: ProgressSummary = {
    summary: splitBilingual(lineValue(lines, 'Summary:'), 'The summary line'),
    started: lineValue(lines, 'Started:'),
    completed: lineValue(lines, 'Completed:'),
    lastUpdated: lineValue(lines, 'Last updated:'),
    built: [],
    left: [],
    pending: [],
  };
  let list: ListField | null = null;
  for (const line of lines) {
    if (line in LISTS) {
      list = LISTS[line] ?? null;
    } else if (line.startsWith('- ') && list !== null) {
      const item = line.slice(2);
      if (list === 'pending') summary.pending.push(readPendingItem(item));
      else summary[list].push(splitBilingual(item, `A ${list} item`));
    }
  }
  if (!summary.started || !summary.lastUpdated) {
    throw new Error('A progress summary needs "Started:" and "Last updated:" lines');
  }
  return summary;
}
