import { z } from 'zod';

const text = z.string().trim().min(1);

/** Brief 23 A2 and D-214 (O-139, O-140, O-144): what the officer fills in to generate a letter. */
export const generateLetterSchema = z.object({
  templateId: text,
  recipientName: text,
  recipientAddress: text.nullable(),
  subject: text,
  fieldValues: z.record(z.string(), z.string()),
  signerRoleId: text,
  replyToLetterInId: text.nullable(),
});

/** O-142: "Preview PDF" shows the form as it stands, filled in or not. */
export const previewLetterSchema = z.object({
  templateId: text,
  recipientName: z.string(),
  recipientAddress: z.string().nullable(),
  fieldValues: z.record(z.string(), z.string()),
  signerRoleId: text,
});

export type GenerateLetter = z.infer<typeof generateLetterSchema>;
export type PreviewLetter = z.infer<typeof previewLetterSchema>;
