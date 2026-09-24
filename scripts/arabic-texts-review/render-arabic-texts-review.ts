export interface TextFile {
  file: string;
  english: Record<string, unknown>;
  arabic: Record<string, unknown>;
}

function flatten(value: unknown, prefix = ''): [string, string][] {
  if (typeof value === 'string') return [[prefix, value]];
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  );
}

function cell(text: string): string {
  return text.replaceAll('|', '\\|');
}

/**
 * `docs/arabic-texts-review.md` (D-037): every interface text in English
 * beside its Arabic draft, one table per text file, for the owner's review.
 */
export function renderArabicTextsReview(files: readonly TextFile[]): string {
  const parts = [
    '# Arabic interface texts, for owner review',
    '',
    'Every English text in the portal beside its Arabic draft (D-013, D-037). Drafted by Claude Code and awaiting owner review. Each section is one file in `src/web/text/`. To change a translation, mark it here or name the key; `src/web/text/ar/` changes, and this file is regenerated with `npm run arabic-texts-review`.',
    '',
    'Language names ("English", "العربية") are the same in both columns on purpose: each language is always named in its own script.',
  ];
  let total = 0;
  for (const { file, english, arabic } of files) {
    const arabicByKey = new Map(flatten(arabic));
    parts.push('', `## \`${file}\``, '', '| Key | English | Arabic |', '|---|---|---|');
    for (const [key, text] of flatten(english)) {
      parts.push(
        `| \`${key}\` | ${cell(text)} | <span dir="rtl">${cell(arabicByKey.get(key) ?? '')}</span> |`,
      );
      total += 1;
    }
  }
  parts.splice(2, 0, `${String(total)} texts in all.`, '');
  return `${parts.join('\n')}\n`;
}
