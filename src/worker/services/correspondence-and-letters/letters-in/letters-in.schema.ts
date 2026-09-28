import { z } from 'zod';
import { LETTER_IN_STATUSES } from '../../../../shared/correspondence-and-letters/letter-in-statuses';

const text = z.string().trim().min(1);

/** Brief 9.3, step one: the scan or photo about to be uploaded (D-214, O-143). */
export const startLetterInSchema = z.object({
  fileName: z.string().min(1),
  size: z.number().int().nonnegative(),
  contentType: z.string().min(1),
});

/** Brief 23 B3 and D-214 (O-143, O-146): the uploaded file, and the letter's details. */
export const completeLetterInSchema = z.object({
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
  dateReceived: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sender: text,
  subject: text,
  handlerPersonId: text,
  answersLetterOutId: text.nullable(),
});

/** O-144: a status moved by hand, from the version read (9.1). */
export const letterInStatusSchema = z.object({
  status: z.enum(LETTER_IN_STATUSES),
  version: z.number().int().positive(),
});

/** O-145: another handling officer, from the version read. */
export const letterInHandlerSchema = z.object({
  handlerPersonId: text,
  version: z.number().int().positive(),
});

/** D-216: the letter out it answers, corrected (or cleared) from the version read. */
export const letterInAnswersSchema = z.object({
  answersLetterOutId: text.nullable(),
  version: z.number().int().positive(),
});

export type StartLetterIn = z.infer<typeof startLetterInSchema>;
export type CompleteLetterIn = z.infer<typeof completeLetterInSchema>;
