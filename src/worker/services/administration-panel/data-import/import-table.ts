import { parseCsv } from '../../../../shared/core/parse-csv';

export interface ImportRow {
  line: number;
  values: Record<string, string>;
}

/**
 * A file's rows keyed by its header, checked against the columns it must
 * have, in order. Blank values are empty strings; problems go in `errors`.
 */
export function readImportTable(
  file: string,
  text: string,
  columns: readonly string[],
  errors: string[],
): ImportRow[] {
  const [header = [], ...rows] = parseCsv(text);
  if (header.map((h) => h.trim()).join(',') !== columns.join(',')) {
    errors.push(`${file}: the first row must be exactly: ${columns.join(',')}`);
    return [];
  }
  return rows.map((cells, i) => ({
    line: i + 2,
    values: Object.fromEntries(columns.map((c, j) => [c, (cells[j] ?? '').trim()])),
  }));
}

export const isDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

/** An empty cell means none. */
export const blankToNull = (value: string | undefined) =>
  value === undefined || value === '' ? null : value;
