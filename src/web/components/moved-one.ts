/** The ids in order, with the one at `index` moved one place up (-1) or down (1). */
export function movedOne(ids: readonly string[], index: number, step: -1 | 1): string[] {
  const next = [...ids];
  const [id] = next.splice(index, 1);
  if (id !== undefined) next.splice(index + step, 0, id);
  return next;
}
