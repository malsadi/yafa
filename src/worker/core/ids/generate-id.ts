// Crockford's Base32: excludes I, L, O and U to avoid confusion with 1, 0 and V.
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ENCODING_LENGTH = ENCODING.length;
const TIME_CHARS = 10; // 10 chars * 5 bits = 50 bits, comfortably covers a 48-bit millisecond timestamp.
const RANDOM_CHARS = 16; // 16 chars * 5 bits = 80 bits of randomness, per the ULID spec.

function encodeTime(time: number): string {
  let remaining = time;
  let result = '';
  for (let i = 0; i < TIME_CHARS; i += 1) {
    const digit = remaining % ENCODING_LENGTH;
    result = ENCODING.charAt(digit) + result;
    remaining = Math.floor(remaining / ENCODING_LENGTH);
  }
  return result;
}

function encodeRandom(): string {
  const bytes = new Uint8Array(RANDOM_CHARS);
  crypto.getRandomValues(bytes);
  let result = '';
  for (const byte of bytes) {
    // 256 is an exact multiple of 32, so `% ENCODING_LENGTH` introduces no bias.
    result += ENCODING.charAt(byte % ENCODING_LENGTH);
  }
  return result;
}

/**
 * Generates a ULID: a 26-character, lexicographically sortable, globally
 * unique identifier. Every table's primary key uses this (brief section 9.1).
 */
export function generateId(): string {
  return encodeTime(Date.now()) + encodeRandom();
}
