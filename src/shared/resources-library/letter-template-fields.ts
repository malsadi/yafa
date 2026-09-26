/**
 * D-101: in a template's subject and body, a field is written as its name
 * in double braces, such as {{recipient}}, and is filled in when a letter
 * is written from it (brief 23 A2).
 */
const FIELD_MARK = /\{\{([^{}]+)\}\}/g;

/** The field names a text uses, as written between the braces. */
export function fieldsUsedIn(text: string): string[] {
  return [...text.matchAll(FIELD_MARK)].map((match) => (match[1] ?? '').trim());
}

/** A field as it is written in the text. */
export function fieldMark(name: string): string {
  return `{{${name}}}`;
}

/** The text with each field replaced, for example by a placeholder in a preview (D-102). */
export function replaceFields(text: string, replace: (name: string) => string): string {
  return text.replace(FIELD_MARK, (_, name: string) => replace(name.trim()));
}
