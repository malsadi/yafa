import { z } from 'zod';
import { ARCHIVE_DATE_FIELDS } from '../../../../shared/documents-archive/archive-document';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Brief 15 B1 (D-097): search by title, category, branch or either date. */
export const archiveSearchSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    categoryId: z.string().min(1).optional(),
    unitId: z.string().min(1).optional(),
    dateField: z.enum(ARCHIVE_DATE_FIELDS).optional(),
    from: date.optional(),
    to: date.optional(),
  })
  .refine((search) => (search.from === undefined && search.to === undefined) || search.dateField, {
    message: 'A date range needs the date it applies to.',
  });

export type ArchiveSearch = z.infer<typeof archiveSearchSchema>;
