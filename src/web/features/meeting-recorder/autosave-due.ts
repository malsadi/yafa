/**
 * D-207: whether text should save itself now — changed since last saved,
 * not empty, and no save already on its way.
 */
export function autosaveDue(p: { text: string; saved: string; busy: boolean }): boolean {
  return !p.busy && p.text.trim() !== '' && p.text !== p.saved;
}
