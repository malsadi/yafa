import { z } from 'zod';
import { fieldsUsedIn } from '../../../../shared/resources-library/letter-template-fields';

const text = z.string().trim().min(1);
const fieldName = text.refine((name) => !/[{}]/.test(name), {
  message: 'A field name has no braces.',
});

/**
 * Brief 16 D1, P19 and D-101: a template's title, subject, body, the fields
 * its author named (each once), and its language. Every field its subject
 * and body use must be one of them, so each can be filled in.
 */
export const letterTemplateInputSchema = z
  .object({
    title: text,
    // D-112: optional; left empty, the template has none.
    subject: z
      .string()
      .trim()
      .transform((subject) => (subject === '' ? null : subject))
      .nullable()
      .default(null),
    body: text,
    fields: z.array(fieldName).refine((names) => new Set(names).size === names.length, {
      message: 'Each field is named once.',
    }),
    language: z.enum(['en', 'ar']),
  })
  .refine(
    (t) =>
      [...fieldsUsedIn(t.subject ?? ''), ...fieldsUsedIn(t.body)].every((f) =>
        t.fields.includes(f),
      ),
    { message: 'Every field used is in the field list.', path: ['fields'] },
  );

export const letterTemplateSaveSchema = z.object({
  template: letterTemplateInputSchema,
  version: z.number().int().positive(),
});

export type LetterTemplateInput = z.infer<typeof letterTemplateInputSchema>;
