import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { preparePhoto } from '../../app/files/prepare-photo';
import { sendToStorage } from '../../app/files/send-to-storage';
import { useActiveSession } from '../../app/session/use-active-session';
import { ACHIEVEMENTS_KEY } from './achievements.api';

/** A photo's name once made a JPEG (9.3). */
const jpegName = (name: string) => `${name.replace(/\.[^.]*$/, '') || 'photo'}.jpg`;

/** Brief 24 A1 and 9.3: a photo made a JPEG within the administrator's size on the device, then recorded. */
export function useAddPhoto(photosPath: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const { photoMaxDimensionPx } = useActiveSession();
  return useMutation({
    mutationFn: async (file: File) => {
      // 8.1: until the administrator sets the photo size, photos wait.
      if (photoMaxDimensionPx === null) throw new Error('setting.not-configured');
      const photo = {
        body: await preparePhoto(file, photoMaxDimensionPx),
        fileName: jpegName(file.name),
        contentType: 'image/jpeg',
      };
      const { sent } = await sendToStorage(request, `${photosPath}/uploads`, photo);
      await request(photosPath, { method: 'PUT', body: sent });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ACHIEVEMENTS_KEY }),
  });
}
