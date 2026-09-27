import { z } from 'zod';

const optionalText = z
  .string()
  .trim()
  .transform((text) => (text === '' ? null : text))
  .nullable()
  .default(null);

/** D-178: a default task — a title, an optional description, and how many days before the first day it is due. */
export const templateTaskSchema = z.object({
  title: z.string().trim().min(1),
  description: optionalText,
  daysBefore: z.number().int().min(0),
});

/** D-178 and D-131: a budget line — a name and an amount in pence (build rule 3). */
export const budgetLineSchema = z.object({
  name: z.string().trim().min(1),
  amountPence: z.number().int().min(0),
});

/** Brief 21 A3 and D-178: a template's name, default tasks and default budget lines. */
export const templateSchema = z.object({
  name: z.string().trim().min(1),
  tasks: z.array(templateTaskSchema),
  budgetLines: z.array(budgetLineSchema),
});

export const templateSaveSchema = z.object({
  template: templateSchema,
  version: z.number().int().positive(),
});
export const versionSchema = z.object({ version: z.number().int().positive() });

export type TemplateInput = z.infer<typeof templateSchema>;
export type BudgetLineInput = z.infer<typeof budgetLineSchema>;
