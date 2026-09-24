export interface ProgressSummary {
  status: string;
  summary: string;
  started: string;
  completed: string;
  lastUpdated: string;
  built: string[];
  left: string[];
  pending: PendingItem[];
}

/** A pending item in plain words; `reference` is an internal link, never shown. */
export interface PendingItem {
  text: string;
  reference: string | null;
}

type ListField = 'built' | 'left';
type LineField = 'status' | 'summary' | 'started' | 'completed' | 'lastUpdated';

const START = '<!-- progress:start -->';
const END = '<!-- progress:end -->';
const LINE_FIELDS: Record<string, LineField> = {
  'Status:': 'status',
  'Summary:': 'summary',
  'Started:': 'started',
  'Completed:': 'completed',
  'Last updated:': 'lastUpdated',
};
const LIST_HEADINGS: Record<string, ListField | 'pending'> = {
  'Built:': 'built',
  'Left:': 'left',
  'Pending:': 'pending',
};

/** "A decision on role names {O-021}" → text plus its hidden reference. */
function readPendingItem(line: string): PendingItem {
  const match = /^(.*?)\s*\{([A-Z]-\d+)\}$/.exec(line);
  return match
    ? { text: match[1] ?? '', reference: match[2] ?? null }
    : { text: line, reference: null };
}

/**
 * Reads the public progress summary a phase report carries between the
 * `progress:start`/`progress:end` markers (D-040, D-045, D-056). Returns
 * null for a report with no block; throws if a required line is missing.
 */
export function readProgressSummary(report: string): ProgressSummary | null {
  const start = report.indexOf(START);
  const end = report.indexOf(END);
  if (start === -1 || end === -1) {
    return null;
  }
  const summary: ProgressSummary = {
    status: '',
    summary: '',
    started: '',
    completed: '',
    lastUpdated: '',
    built: [],
    left: [],
    pending: [],
  };
  let list: ListField | 'pending' | null = null;
  for (const line of report
    .slice(start + START.length, end)
    .split('\n')
    .map((l) => l.trim())) {
    const lineField = Object.entries(LINE_FIELDS).find(([label]) => line.startsWith(label));
    if (lineField) {
      const [label, field] = lineField;
      summary[field] = line.slice(label.length).trim();
    } else if (line in LIST_HEADINGS) {
      list = LIST_HEADINGS[line] ?? null;
    } else if (line.startsWith('- ') && list !== null) {
      const item = line.slice(2);
      if (list === 'pending') {
        summary.pending.push(readPendingItem(item));
      } else {
        summary[list].push(item);
      }
    }
  }
  for (const required of ['status', 'summary', 'started', 'lastUpdated'] as const) {
    if (!summary[required]) {
      throw new Error(`A progress summary needs a "${required}" line`);
    }
  }
  return summary;
}
