/**
 * Brief 23 B1 and D-214 (O-136, O-137): a reference number format, built
 * from the placeholders `{unit_code}`, `{year}` and `{number}` — or
 * `{number:N}`, the number written with at least N digits. Every format
 * holds exactly one number and at least one year, since the numbers
 * restart each year; without the year, references would collide.
 */
const PLACEHOLDER = /\{([^{}]*)\}/g;
const NUMBER = /^number(?::([1-9]))?$/;

export type ReferenceFormatProblem =
  'empty' | 'unknown-placeholder' | 'stray-brace' | 'no-number' | 'number-twice' | 'no-year';

/** What is wrong with a format, if anything; the settings screen and the Worker both check it. */
export function referenceFormatProblems(format: string): ReferenceFormatProblem[] {
  if (format.trim() === '') return ['empty'];
  const problems = new Set<ReferenceFormatProblem>();
  const names = [...format.matchAll(PLACEHOLDER)].map((m) => m[1] ?? '');
  if (/[{}]/.test(format.replace(PLACEHOLDER, ''))) problems.add('stray-brace');
  if (names.some((n) => n !== 'unit_code' && n !== 'year' && !NUMBER.test(n)))
    problems.add('unknown-placeholder');
  const numbers = names.filter((n) => NUMBER.test(n)).length;
  if (numbers === 0) problems.add('no-number');
  if (numbers > 1) problems.add('number-twice');
  if (!names.includes('year')) problems.add('no-year');
  return [...problems];
}

export function isValidReferenceFormat(format: string): boolean {
  return referenceFormatProblems(format).length === 0;
}

/** O-138: a reference number, always in Western digits. */
export function formatReference(
  format: string,
  values: { unitCode: string; year: number; number: number },
): string {
  return format.replace(PLACEHOLDER, (whole, name: string) => {
    if (name === 'unit_code') return values.unitCode;
    if (name === 'year') return String(values.year);
    const width = NUMBER.exec(name);
    if (!width) return whole;
    return String(values.number).padStart(Number(width[1] ?? '1'), '0');
  });
}
