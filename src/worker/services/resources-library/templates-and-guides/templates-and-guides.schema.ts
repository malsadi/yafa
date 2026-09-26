import { z } from 'zod';
import { LANGUAGES } from '../../../../shared/core/languages';
import { RESOURCE_KINDS } from '../../../../shared/resources-library/resource';

const multipart = z
  .object({
    uploadId: z.string().min(1),
    parts: z.array(z.object({ partNumber: z.number().int().positive(), etag: z.string().min(1) })),
  })
  .optional();

/** D-103: a title, an optional description, and the language the file is in. */
export const resourceDetailsSchema = z.object({
  title: z.string().trim().min(1),
  description: z
    .string()
    .trim()
    .transform((text) => (text === '' ? null : text))
    .nullable()
    .default(null),
  language: z.enum(LANGUAGES),
});

export const startResourceUploadSchema = z.object({
  fileName: z.string().min(1),
  size: z.number().int().nonnegative(),
  contentType: z.string().min(1),
});

/** Brief 16 A1, A2: a new template or guide — its uploaded file and details. */
export const completeResourceSchema = resourceDetailsSchema.extend({
  kind: z.enum(RESOURCE_KINDS),
  fileId: z.string().min(1),
  fileName: z.string().min(1),
  multipart,
});

/** D-104: a replacement file, from the version read (9.1). */
export const completeReplacementSchema = z.object({
  fileId: z.string().min(1),
  fileName: z.string().min(1),
  multipart,
  version: z.number().int().positive(),
});

export const resourceDetailsSaveSchema = z.object({
  details: resourceDetailsSchema,
  version: z.number().int().positive(),
});

export type ResourceDetails = z.infer<typeof resourceDetailsSchema>;
export type CompleteResource = z.infer<typeof completeResourceSchema>;
export type CompleteReplacement = z.infer<typeof completeReplacementSchema>;
