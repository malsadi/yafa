import { z } from 'zod';

/** Brief 15 A4 and D-110: a new version's uploaded file, and its own document date. */
export const completeVersionUploadSchema = z.object({
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
  documentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CompleteVersionUpload = z.infer<typeof completeVersionUploadSchema>;
