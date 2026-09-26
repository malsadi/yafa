import { z } from 'zod';
import { ARCHIVE_UPLOAD_CATEGORIES } from '../../../../shared/documents-archive/archive-document';

export const startArchiveUploadSchema = z.object({
  fileName: z.string().min(1),
  size: z.number().int().nonnegative(),
  contentType: z.string().min(1),
});

/** Brief 15 A2, D-096 and D-097: the uploaded file, and the document's details. */
export const completeArchiveUploadSchema = z.object({
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
  categoryId: z.enum(ARCHIVE_UPLOAD_CATEGORIES),
  title: z.string().trim().min(1),
  description: z
    .string()
    .trim()
    .transform((text) => (text === '' ? null : text))
    .nullable()
    .optional(),
  documentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CompleteArchiveUpload = z.infer<typeof completeArchiveUploadSchema>;
