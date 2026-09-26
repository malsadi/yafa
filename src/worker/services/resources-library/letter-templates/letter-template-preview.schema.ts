import { z } from 'zod';
import { LANGUAGES } from '../../../../shared/core/languages';

/**
 * D-111: the template as it is being written — possibly not yet complete
 * or saved — and the sample words for the logo's place and the signer, in
 * the template's language.
 */
export const letterTemplatePreviewSchema = z.object({
  template: z.object({
    subject: z.string().nullable(),
    body: z.string(),
    language: z.enum(LANGUAGES),
  }),
  logoPlaceholder: z.string(),
  signer: z.object({ name: z.string(), role: z.string() }),
});

export type LetterTemplatePreview = z.infer<typeof letterTemplatePreviewSchema>;
