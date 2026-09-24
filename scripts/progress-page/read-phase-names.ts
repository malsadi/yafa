/**
 * The phase list, from the brief's own section 26 headings. The service
 * numbers in brackets are dropped, since the page shows names only.
 */
export function readPhaseNames(brief: string): { number: number; name: string }[] {
  const phases: { number: number; name: string }[] = [];
  for (const match of brief.matchAll(/^### Phase (\d+) — (.+)$/gm)) {
    const name = (match[2] ?? '').replace(/\s*\([^)]*\)/g, '').trim();
    phases.push({ number: Number(match[1]), name });
  }
  return phases;
}

/** The portal's name, from the brief's own title line (D-056). */
export function readPortalName(brief: string): string {
  const title = /^# .+? — (.+)$/m.exec(brief)?.[1];
  if (!title) {
    throw new Error('The brief has no title line to take the portal name from');
  }
  return title.trim();
}

/** The O-numbers still in `docs/decisions.md`'s "Open" table. */
export function readOpenQuestionIds(decisions: string): string[] {
  const open = decisions.slice(decisions.indexOf('\n## Open\n'));
  return [...open.matchAll(/^\| (O-\d+)/gm)].map((match) => match[1] ?? '');
}
