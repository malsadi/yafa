import { replaceFields } from './letter-template-fields';

/** D-102: how a field shows in a preview — its name, marked as a placeholder. */
const placeholder = (name: string) => `[${name}]`;

/**
 * D-102 and D-112: a template's letter for a preview — its subject, if it
 * has one, and its paragraphs, with each field shown as a placeholder.
 */
export function templateLetter(draft: { subject: string | null; body: string }): {
  subject?: string;
  paragraphs: string[];
} {
  const subject = draft.subject?.trim();
  return {
    ...(subject ? { subject: replaceFields(subject, placeholder) } : {}),
    paragraphs: replaceFields(draft.body, placeholder).split(/\n\s*\n/),
  };
}
