import type { BrowserWorker } from '@cloudflare/puppeteer';
import { buildStatement } from '../../../../pdf-templates/treasury-statement/build-statement';
import type { StatementDocument } from '../../../../pdf-templates/treasury-statement/statement-document';
import { renderBrandedPdf } from '../../administration-panel';

/** Turns a written-out statement into PDF bytes. */
export type StatementRenderer = (document: StatementDocument) => Promise<Uint8Array>;

/** Brief 9.4: statements are rendered through Browser Rendering, during the request. */
export function browserStatementRenderer(
  db: D1Database,
  services: { bucket: R2Bucket; browser: BrowserWorker | undefined },
): StatementRenderer {
  return (document) => {
    const { bodyHtml, css } = buildStatement(document);
    return renderBrandedPdf(db, services, { bodyHtml, css, language: document.language });
  };
}
