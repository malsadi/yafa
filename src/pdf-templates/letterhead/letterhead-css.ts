/**
 * D-081: the one fixed letterhead design. The logo sits at the line's start,
 * centre or end, so it mirrors in Arabic by itself (D-089: "left becomes the
 * start of the line"). Text is black on white; the main colour is for the
 * organisation's name, the accent colour for the rule (D-082). Every class
 * starts `lh-`, so the design never touches the page around it.
 */
export const LETTERHEAD_CSS = `
.lh { color: #000; background: #fff; font-family: 'Portal Latin', 'Portal Arabic', sans-serif; line-height: 1.5; }
.lh-head { display: flex; align-items: flex-start; gap: 12mm; }
.lh-logo-left { flex-direction: row; }
.lh-logo-right { flex-direction: row-reverse; }
.lh-logo-centre { flex-direction: column; align-items: center; text-align: center; }
.lh-logo { max-height: 25mm; max-width: 60mm; }
.lh-logo-space { width: 40mm; height: 20mm; border: 1px dashed #666; display: flex; align-items: center; justify-content: center; font-size: 9pt; color: #444; }
.lh-org { flex: 1; }
.lh-logo-right .lh-org { text-align: start; }
.lh-org-name { font-size: 16pt; font-weight: bold; margin: 0; }
.lh-unit, .lh-address { margin: 0; white-space: pre-line; }
.lh-rule { border: 0; border-top: 2px solid; margin: 6mm 0; }
.lh-body p { margin: 0 0 4mm; white-space: pre-line; }
.lh-signature { margin-top: 12mm; }
.lh-sign-space { width: 60mm; height: 18mm; border-bottom: 1px solid #000; margin-bottom: 2mm; }
.lh-signature p { margin: 0; }
`;
