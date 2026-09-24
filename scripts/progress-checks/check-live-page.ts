import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PROGRESS_PAGE_FILES } from '../progress-page/generate-progress-page.ts';

const ATTEMPTS = 6;
const WAIT_MS = 10_000;

async function fetchLive(baseUrl: string, pagePath: string, attempt: number): Promise<string> {
  // A unique query string gets past any cache between here and the Worker;
  // the progress route ignores it (T-066).
  const response = await fetch(
    `${baseUrl}${pagePath}?live-check=${String(Date.now())}-${String(attempt)}`,
    {
      headers: { 'Cache-Control': 'no-cache' },
    },
  );
  return response.ok ? response.text() : `HTTP ${String(response.status)}`;
}

function stamp(html: string): string {
  return /datetime="([^"]+)"/.exec(html)?.[1] ?? 'no timestamp';
}

/**
 * D-060, check 3: after a deploy, the live pages are exactly the ones just
 * built from this commit. Retries while the new version spreads, then
 * reports each page still behind, with both timestamps.
 */
export async function findStaleLivePages(
  baseUrl: string,
  root: string,
  retry: { attempts: number; waitMs: number } = { attempts: ATTEMPTS, waitMs: WAIT_MS },
): Promise<string[]> {
  const pages = Object.values(PROGRESS_PAGE_FILES).map((file) => ({
    path: file.replace(/^public/, ''),
    expected: readFileSync(path.join(root, file), 'utf8'),
  }));
  let stale: string[] = [];
  for (let attempt = 1; attempt <= retry.attempts; attempt += 1) {
    stale = [];
    for (const page of pages) {
      const live = await fetchLive(baseUrl, page.path, attempt);
      if (live !== page.expected) {
        stale.push(
          `${page.path}: live shows ${stamp(live)}, this commit built ${stamp(page.expected)}`,
        );
      }
    }
    if (stale.length === 0 || attempt === retry.attempts) break;
    await new Promise((resolve) => setTimeout(resolve, retry.waitMs));
  }
  return stale;
}

if (import.meta.url === `file://${process.argv[1] ?? ''}`) {
  const baseUrl = process.argv[2];
  if (!baseUrl) {
    console.error('usage: check-live-page.ts <preview base URL>');
    process.exit(2);
  }
  const stale = await findStaleLivePages(baseUrl, process.cwd());
  for (const page of stale) console.error(`✗ ${page}`);
  if (stale.length > 0) process.exit(1);
  console.log('✓ the live progress pages are exactly this commit’s');
}
