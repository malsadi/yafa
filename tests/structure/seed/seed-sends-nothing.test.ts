import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// D-062: "a test will fail if the seed loader can reach the invitation
// sender". Follows every import of the seed commands, file by file, and
// fails on anything that could send: Clerk's SDK, the Worker's Clerk
// adapter, or the invitations service.
const ENTRY_POINTS = ['scripts/seed/load-seed.ts', 'scripts/seed/list-invitations.ts'];
const SENDERS = [
  /@clerk\//,
  /src\/worker\/clerk\//,
  /src\/worker\/services\/committee-register\/invitations\//,
];

// Static imports and re-exports, side-effect imports, and dynamic import().
const IMPORT =
  /(?:import|export)\s*(?:[^'"]*?\sfrom\s*)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]/g;

function importsOf(file: string): string[] {
  return [...readFileSync(file, 'utf8').matchAll(IMPORT)].map((m) => m[1] ?? m[2] ?? '');
}

/** The file a relative import names, with or without its extension, or a folder's index. */
function resolveFile(from: string, specifier: string): string {
  const base = resolve(dirname(from), specifier);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts')];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? base;
}

function reachable(entry: string): string[] {
  const seen = new Set<string>();
  const queue = [resolve(entry)];
  const packages: string[] = [];
  while (queue.length > 0) {
    const file = queue.pop() ?? '';
    if (seen.has(file)) continue;
    seen.add(file);
    for (const specifier of importsOf(file)) {
      if (specifier.startsWith('.')) queue.push(resolveFile(file, specifier));
      else packages.push(specifier);
    }
  }
  return [...seen, ...packages];
}

describe('the seed commands send nothing (D-062)', () => {
  for (const entry of ENTRY_POINTS) {
    it(`${entry} cannot reach anything that sends an invitation`, () => {
      const reached = reachable(entry);
      expect(reached.length).toBeGreaterThan(1);
      for (const sender of SENDERS) {
        expect(
          reached.filter((path) => sender.test(path)),
          String(sender),
        ).toEqual([]);
      }
    });
  }
});
