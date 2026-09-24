export interface ProgressSummary {
  status: string;
  lastUpdated: string;
  done: string[];
  left: string[];
  openQuestions: string[];
  proposals: string[];
}

const START = '<!-- progress:start -->';
const END = '<!-- progress:end -->';
const LIST_HEADINGS: Record<string, keyof ProgressSummary> = {
  'Done:': 'done',
  'Left:': 'left',
  'Open questions:': 'openQuestions',
  'Proposals awaiting confirmation:': 'proposals',
};

/**
 * Reads the public progress summary a phase report carries between the
 * `progress:start`/`progress:end` markers (D-040). Returns null for a report
 * with no summary block; throws if the block is missing a required line.
 */
export function readProgressSummary(report: string): ProgressSummary | null {
  const start = report.indexOf(START);
  const end = report.indexOf(END);
  if (start === -1 || end === -1) {
    return null;
  }
  const summary: ProgressSummary = {
    status: '',
    lastUpdated: '',
    done: [],
    left: [],
    openQuestions: [],
    proposals: [],
  };
  let list: keyof ProgressSummary | null = null;
  for (const line of report
    .slice(start + START.length, end)
    .split('\n')
    .map((l) => l.trim())) {
    if (line.startsWith('Status:')) summary.status = line.slice('Status:'.length).trim();
    else if (line.startsWith('Last updated:')) summary.lastUpdated = line.slice(13).trim();
    else if (line in LIST_HEADINGS) list = LIST_HEADINGS[line] ?? null;
    else if (line.startsWith('- ') && list) (summary[list] as string[]).push(line.slice(2));
  }
  if (!summary.status || !summary.lastUpdated) {
    throw new Error('A progress summary needs "Status:" and "Last updated:" lines');
  }
  return summary;
}
