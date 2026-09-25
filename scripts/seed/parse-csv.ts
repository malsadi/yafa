/**
 * Parses CSV text as docs/seed-files.md describes it: UTF-8 (a leading
 * byte-order mark is dropped, as Excel writes one), comma-separated,
 * double quotes around a value that holds a comma, a quote ("") or a line
 * break. Returns every row, the header included; blank lines are skipped.
 */
export function parseCsv(text: string): string[][] {
  const source = text.startsWith('﻿') ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source.charAt(i);
    if (quoted) {
      if (char === '"' && source.charAt(i + 1) === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source.charAt(i + 1) === '\n') i += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else value += char;
  }
  if (value !== '' || row.length > 0) rows.push([...row, value]);
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}
