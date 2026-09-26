import { preparePhoto } from '../../app/files/prepare-photo';
import { sendToStorage, type SentFile } from '../../app/files/send-to-storage';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

/** A photo's name once made a JPEG (9.3). */
const jpegName = (name: string) => `${name.replace(/\.[^.]*$/, '') || 'receipt'}.jpg`;

/**
 * Brief 17 B4 and 9.3: receipt photos resized on the device, then sent to
 * storage under one entry — its id given out with the first, or the one it
 * already has. Recorded by the entry's own save.
 */
export async function sendReceiptPhotos(
  request: Request,
  params: { startPath: string; files: File[]; maxDimension: number | null; entryId?: string },
): Promise<{ entryId: string | undefined; receipts: SentFile[] }> {
  let entryId = params.entryId;
  const receipts: SentFile[] = [];
  for (const file of params.files) {
    // 8.1: until the administrator sets the photo size, photos wait.
    if (params.maxDimension === null) throw new Error('setting.not-configured');
    const photo = await preparePhoto(file, params.maxDimension);
    const details = entryId ? { entryId } : {};
    const { started, sent } = await sendToStorage(
      request,
      params.startPath,
      { body: photo, fileName: jpegName(file.name), contentType: 'image/jpeg' },
      details,
    );
    entryId = String(started.entryId);
    receipts.push(sent);
  }
  return { entryId, receipts };
}
