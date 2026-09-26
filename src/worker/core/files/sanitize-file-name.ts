// Every Unicode control character (general category Cc): U+0000 to U+001F,
// U+007F, and U+0080 to U+009F. Named by its Unicode class, not by a range
// of raw control characters, so the lint rule against those stays on.
const CONTROL_CHARACTERS = /\p{Cc}/gu;
const PATH_SEPARATORS = /[/\\]/g;
const DEFAULT_MAX_BYTES = 200;

/**
 * Brief section 9.3's object key embeds the officer's own file name
 * verbatim (`{fileId}-{safeName}`) — officers type Arabic as well as
 * English, so this never reduces the name to ASCII. It only strips what
 * would break the key itself: path separators (which would silently
 * create extra "folders" in the key) and control characters, then caps
 * the byte length so a very long original name can't push the whole
 * object key over R2's 1024-byte key limit (`buildObjectKey`'s own final
 * check covers the rest).
 */
export function sanitizeFileName(rawName: string, maxBytes: number = DEFAULT_MAX_BYTES): string {
  const stripped = rawName.replace(PATH_SEPARATORS, '-').replace(CONTROL_CHARACTERS, '').trim();
  if (stripped.length === 0) {
    throw new RangeError('sanitizeFileName: nothing left after stripping the file name');
  }
  return truncateToByteLength(stripped, maxBytes);
}

function truncateToByteLength(value: string, maxBytes: number): string {
  const encoder = new TextEncoder();
  if (encoder.encode(value).length <= maxBytes) {
    return value;
  }

  // Drop one character at a time, never one byte at a time — a multi-byte
  // character (Arabic script, an emoji) must never be cut in half.
  let truncated = value;
  while (encoder.encode(truncated).length > maxBytes) {
    truncated = truncated.slice(0, -1);
  }
  return truncated;
}
