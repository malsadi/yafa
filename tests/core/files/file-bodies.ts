const ascii = (text: string) => Array.from(new TextEncoder().encode(text));

// D-218: uploads must start as their declared type does, so test files
// carry their format's real leading bytes, then some fictional content.
const LEADING: Record<string, number[]> = {
  'application/pdf': ascii('%PDF-1.7\n'),
  'image/jpeg': [0xff, 0xd8, 0xff, 0xe0],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    0x50, 0x4b, 0x03, 0x04,
  ],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [0x50, 0x4b, 0x03, 0x04],
  'video/mp4': [0, 0, 0, 0x18, ...ascii('ftypmp42')],
  'font/woff2': ascii('wOF2'),
  'font/ttf': [0x00, 0x01, 0x00, 0x00],
  'font/otf': ascii('OTTO'),
};

/** A fictional file of the given type: its leading bytes, then `content`. */
export function fileBodyOf(contentType: string, content = 'fictional'): Uint8Array {
  const leading = LEADING[contentType];
  if (!leading) throw new Error(`No test body for ${contentType}`);
  return new Uint8Array([...leading, ...new TextEncoder().encode(content)]);
}
