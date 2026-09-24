export interface ProgressSummary {
  status: string;
  summary: string;
  started: string;
  approved: string;
  lastUpdated: string;
  done: string[];
  left: string[];
  waitingOnOwner: string[];
  openQuestions: string[];
  proposals: string[];
}

type ListField = 'done' | 'left' | 'waitingOnOwner' | 'openQuestions' | 'proposals';
type LineField = 'status' | 'summary' | 'started' | 'approved' | 'lastUpdated';

const START = '<!-- progress:start -->';
const END = '<!-- progress:end -->';
const LINE_FIELDS: Record<string, LineField> = {
  'Status:': 'status',
  'Summary:': 'summary',
  'Started:': 'started',
  'Approved:': 'approved',
  'Last updated:': 'lastUpdated',
};
const LIST_HEADINGS: Record<string, ListField> = {
  'Done:': 'done',
  'Left:': 'left',
  'Waiting on the owner:': 'waitingOnOwner',
  'Open questions:': 'openQuestions',
  'Proposals awaiting confirmation:': 'proposals',
};

function emptySummary(): ProgressSummary {
  return {
    status: '',
    summary: '',
    started: '',
    approved: '',
    lastUpdated: '',
    done: [],
    left: [],
    waitingOnOwner: [],
    openQuestions: [],
    proposals: [],
  };
}

/**
 * Reads the public progress summary a phase report carries between the
 * `progress:start`/`progress:end` markers (D-040, D-045). Returns null for a
 * report with no block; throws if a required line is missing.
 */
export function readProgressSummary(report: string): ProgressSummary | null {
  const start = report.indexOf(START);
  const end = report.indexOf(END);
  if (start === -1 || end === -1) {
    return null;
  }
  const summary = emptySummary();
  let list: ListField | null = null;
  for (const line of report
    .slice(start + START.length, end)
    .split('\n')
    .map((l) => l.trim())) {
    const lineField = Object.keys(LINE_FIELDS).find((label) => line.startsWith(label));
    if (lineField) {
      summary[LINE_FIELDS[lineField] as LineField] = line.slice(lineField.length).trim();
    } else if (line in LIST_HEADINGS) {
      list = LIST_HEADINGS[line] ?? null;
    } else if (line.startsWith('- ') && list) {
      summary[list].push(line.slice(2));
    }
  }
  for (const required of ['status', 'summary', 'started', 'lastUpdated'] as const) {
    if (!summary[required]) {
      throw new Error(`A progress summary needs a "${required}" line`);
    }
  }
  return summary;
}
