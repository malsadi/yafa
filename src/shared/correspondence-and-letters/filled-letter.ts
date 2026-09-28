import { replaceFields } from '../resources-library/letter-template-fields';

/**
 * Brief 23 A2: a template's letter with each field filled in as the officer
 * wrote it (D-214, O-139: every field is required). Its subject line
 * appears only if the template has one (D-112).
 */
export function filledLetter(
  template: { subject: string | null; body: string },
  values: Readonly<Record<string, string>>,
): { subject?: string; paragraphs: string[] } {
  const fill = (text: string) => replaceFields(text, (name) => values[name] ?? '');
  const subject = template.subject?.trim();
  return {
    ...(subject ? { subject: fill(subject) } : {}),
    paragraphs: fill(template.body).split(/\n\s*\n/),
  };
}
