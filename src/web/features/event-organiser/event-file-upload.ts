import type { FileUse } from '../../../shared/core/file-uses';
import type { EventFileSection } from '../../../shared/event-organiser/event-statuses';
import type { useApiRequest } from '../../app/api/use-api-request';
import { preparePhoto } from '../../app/files/prepare-photo';
import { sendToStorage } from '../../app/files/send-to-storage';

type Request = ReturnType<typeof useApiRequest>;

/** Brief 21 F1, F2: the file use a chosen file goes under — a photo or video in Media, anything else a document. */
export function fileUseOf(section: EventFileSection, contentType: string): FileUse {
  if (section === 'Documents') return 'documents';
  return contentType.startsWith('video/') ? 'video' : 'media-images';
}

/** A photo's name once made a JPEG (9.3). */
const jpegName = (name: string) => `${name.replace(/\.[^.]*$/, '') || 'photo'}.jpg`;

/** Brief 9.3: a photo is made a JPEG within the administrator's size, on the device; anything else goes as it is. */
async function prepared(file: File, use: FileUse, maxDimension: number | null) {
  if (use !== 'media-images')
    return { body: file as Blob, fileName: file.name, contentType: file.type };
  // 8.1: until the administrator sets the photo size, photos wait.
  if (maxDimension === null) throw new Error('setting.not-configured');
  return {
    body: await preparePhoto(file, maxDimension),
    fileName: jpegName(file.name),
    contentType: 'image/jpeg',
  };
}

/** Brief 9.3 and 21 F1, F2: an event file sent to storage, then recorded in its section. */
export async function uploadEventFile(
  request: Request,
  params: { filesPath: string; section: EventFileSection; file: File; maxDimension: number | null },
): Promise<void> {
  const use = fileUseOf(params.section, params.file.type);
  const details = { section: params.section, use };
  const file = await prepared(params.file, use, params.maxDimension);
  const { sent } = await sendToStorage(request, `${params.filesPath}/uploads`, file, details);
  await request(params.filesPath, { method: 'PUT', body: { ...details, ...sent } });
}
