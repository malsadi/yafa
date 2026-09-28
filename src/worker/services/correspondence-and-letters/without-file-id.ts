/** A letter as officers see it: its file is served through its own route, never named. */
export function withoutFileId<T extends { fileId: string }>(letter: T): Omit<T, 'fileId'> {
  const shown: Partial<T> = { ...letter };
  delete shown.fileId;
  return shown as Omit<T, 'fileId'>;
}
