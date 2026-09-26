/** Brief 16 D2 and D3: whether a filed letter was sent or received. */
export const LETTER_DIRECTIONS = ['out', 'in'] as const;
export type LetterDirection = (typeof LETTER_DIRECTIONS)[number];

/** Brief 16 D2, D3: a letter filed under its reference number, read-only. */
export interface FiledLetterRecord {
  id: string;
  referenceNumber: string;
  fileName: string;
  filedAt: string;
}
