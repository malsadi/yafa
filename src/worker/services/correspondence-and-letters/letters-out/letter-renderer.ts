import type { BrowserWorker } from '@cloudflare/puppeteer';
import type { LetterheadInput } from '../../../../pdf-templates/letterhead/letterhead-input';
import { renderOnLetterhead } from '../../administration-panel';

/** Turns a written letter into PDF bytes. */
export type LetterRenderer = (letter: Omit<LetterheadInput, 'logoSrc'>) => Promise<Uint8Array>;

/** Brief 9.4: a letter on the letterhead, rendered through Browser Rendering during the request. */
export function browserLetterRenderer(
  db: D1Database,
  services: { bucket: R2Bucket; browser: BrowserWorker | undefined },
): LetterRenderer {
  return (letter) => renderOnLetterhead(db, services, letter);
}
