/**
 * The Arabic bundle must have exactly the English bundle's keys (brief
 * section 8.5), with any string in place of each English string. Checked
 * here at compile time and again by `tests/structure/text-key-parity.test.ts`.
 */
export type TextShape<T> = {
  [K in keyof T]: T[K] extends string ? string : TextShape<T[K]>;
};
