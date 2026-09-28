import { z } from 'zod';

/** Brief 9.3, step one: a photo about to be uploaded (made JPEG on the device, 9.3). */
export const startPhotoSchema = z.object({
  fileName: z.string().min(1),
  size: z.number().int().nonnegative(),
  contentType: z.string().min(1),
});

/** Brief 9.3, step two: the uploaded photo, to be checked and recorded. */
export const completePhotoSchema = z.object({
  fileId: z.string().min(1),
  fileName: z.string().min(1),
  multipart: z
    .object({
      uploadId: z.string().min(1),
      parts: z.array(
        z.object({ partNumber: z.number().int().positive(), etag: z.string().min(1) }),
      ),
    })
    .optional(),
});

export type StartPhoto = z.infer<typeof startPhotoSchema>;
export type CompletePhoto = z.infer<typeof completePhotoSchema>;
