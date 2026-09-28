import type { FileType } from '../../../shared/core/file-uses';

/** How many leading bytes the signature check reads. */
export const SIGNATURE_BYTES = 12;

const ascii = (text: string) => Array.from(new TextEncoder().encode(text));
const at = (bytes: Uint8Array, offset: number, expected: readonly number[]) =>
  expected.every((b, i) => bytes[offset + i] === b);

const ZIP = [0x50, 0x4b, 0x03, 0x04];

/**
 * D-218: each stored type's leading bytes, as its format defines them. A
 * file must start the way its declared type does, so an HTML or SVG page
 * can't be stored under a passive type's name. DOCX and XLSX are ZIP files.
 */
const SIGNATURES: Record<FileType, (bytes: Uint8Array) => boolean> = {
  'application/pdf': (b) => at(b, 0, ascii('%PDF-')),
  'image/jpeg': (b) => at(b, 0, [0xff, 0xd8, 0xff]),
  'image/png': (b) => at(b, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (b) => at(b, 0, ZIP),
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': (b) => at(b, 0, ZIP),
  'video/mp4': (b) => at(b, 4, ascii('ftyp')),
  'font/woff2': (b) => at(b, 0, ascii('wOF2')),
  'font/ttf': (b) => at(b, 0, [0x00, 0x01, 0x00, 0x00]) || at(b, 0, ascii('true')),
  'font/otf': (b) => at(b, 0, ascii('OTTO')),
};

/** True when the bytes start as the declared type's format does. */
export function matchesFileSignature(contentType: FileType, bytes: Uint8Array): boolean {
  return SIGNATURES[contentType](bytes);
}
