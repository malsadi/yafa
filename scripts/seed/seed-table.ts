import { parseCsv } from './parse-csv.ts';

/** One CSV file's data rows, keyed by the header's column names, with their line numbers. */
export interface SeedTable {
  file: string;
  rows: { line: number; values: Record<string, string> }[];
}

/**
 * Reads a seed CSV whose header must be exactly `columns`, in order
 * (docs/seed-files.md: "spelled exactly as below"). Values are trimmed.
 * Problems are added to `errors`; the table is empty when the header is wrong.
 */
export function readSeedTable(
  file: string,
  text: string,
  columns: readonly string[],
  errors: string[],
): SeedTable {
  const [header = [], ...data] = parseCsv(text);
  const found = header.map((cell) => cell.trim());
  if (found.join(',') !== columns.join(',')) {
    errors.push(`${file}: the header must be exactly "${columns.join(',')}".`);
    return { file, rows: [] };
  }
  const rows = data.map((cells, index) => {
    if (cells.length !== columns.length) {
      errors.push(`${file} row ${String(index + 2)}: expected ${String(columns.length)} values.`);
    }
    const values = Object.fromEntries(columns.map((c, i) => [c, (cells[i] ?? '').trim()]));
    return { line: index + 2, values };
  });
  return { file, rows };
}

/** An empty seed value means "none" (docs/seed-files.md: "or empty"). */
export function emptyToNull(value: string | undefined): string | null {
  return value === undefined || value === '' ? null : value;
}
