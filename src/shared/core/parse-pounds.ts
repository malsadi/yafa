const POUNDS = /^(\d+)(?:\.(\d{1,2}))?$/;

/**
 * An amount written in pounds ("150", "150.5", "150.50") as integer pence
 * (brief 9.1), worked on the digits, never through a float (T-017). Null
 * for anything else.
 */
export function parsePoundsToPence(text: string): number | null {
  const match = POUNDS.exec(text.trim());
  if (!match) return null;
  const pence = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  return Number.isSafeInteger(pence) ? pence : null;
}

/** Integer pence as the pounds a field shows ("150.50"), the reverse of the above. */
export function penceToPoundsText(pence: number): string {
  return `${String(Math.trunc(pence / 100))}.${String(pence % 100).padStart(2, '0')}`;
}

/** An amount in pounds that may be negative ("-20.50"), as integer pence; null for anything else. */
export function parseSignedPoundsToPence(text: string): number | null {
  const trimmed = text.trim();
  const pence = parsePoundsToPence(trimmed.replace(/^-/, ''));
  if (pence === null) return null;
  return trimmed.startsWith('-') ? -pence : pence;
}
