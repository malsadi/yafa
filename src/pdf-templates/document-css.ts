/**
 * Brief 9.4's documents other than letters — the Treasury statement now,
 * reports in later phases: plain text on white, tables of figures aligned
 * by their logical end so they read the same way in Arabic. Every class
 * starts `doc-`.
 */
export const DOCUMENT_CSS = `
.doc { color: #000; background: #fff; font-family: 'Portal Latin', 'Portal Arabic', sans-serif; line-height: 1.4; font-size: 10pt; }
.doc-head { margin-block-end: 6mm; }
.doc-org { font-size: 14pt; font-weight: bold; margin: 0; }
.doc-title { font-size: 12pt; font-weight: bold; margin: 2mm 0 0; }
.doc-meta { margin: 0; }
.doc-table { width: 100%; border-collapse: collapse; }
.doc-table th, .doc-table td { border-block-end: 1px solid #999; padding: 1.5mm 1mm; text-align: start; vertical-align: top; }
.doc-table .doc-money { text-align: end; white-space: nowrap; }
.doc-total td { font-weight: bold; border-block-end: 2px solid #000; }
`;
