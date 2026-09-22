import { readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Lists every file under `dir`, recursively, as absolute paths. */
export function listSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    return entry.isDirectory() ? listSourceFiles(fullPath) : [fullPath];
  });
}
