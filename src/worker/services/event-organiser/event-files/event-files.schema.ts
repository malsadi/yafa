import { z } from 'zod';
import { FILE_USES, type FileUse } from '../../../../shared/core/file-uses';
import {
  EVENT_FILE_SECTIONS,
  type EventFileSection,
} from '../../../../shared/event-organiser/event-statuses';

const section = z.enum(EVENT_FILE_SECTIONS as [EventFileSection, ...EventFileSection[]]);
const use = z.enum(FILE_USES as unknown as [FileUse, ...FileUse[]]);

/** Brief 9.3, step one: the file about to be uploaded, and where it goes. */
export const startFileSchema = z.object({
  section,
  use,
  fileName: z.string().min(1),
  size: z.number().int().nonnegative(),
  contentType: z.string().min(1),
});

/** Brief 9.3, step two: the uploaded file, to be checked and recorded. */
export const completeFileSchema = z.object({
  section,
  use,
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

export type StartFile = z.infer<typeof startFileSchema>;
export type CompleteFile = z.infer<typeof completeFileSchema>;
