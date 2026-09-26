import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const version = z.number().int().positive();

/** Brief 16 C1 and D-114: the item and quantity; where it is kept and its condition optional. */
export const equipmentDetailsSchema = z.object({
  item: z.string().trim().min(1),
  quantity: z.number().int().nonnegative(),
  location: z
    .string()
    .trim()
    .transform((text) => (text === '' ? null : text))
    .nullable()
    .default(null),
  conditionId: z.string().min(1).nullable().default(null),
});

export const equipmentSaveSchema = z.object({ equipment: equipmentDetailsSchema, version });

/** Brief 16 C2, P20 and D-109: the borrower, how many, the date borrowed and when it is due back. */
export const loanDetailsSchema = z
  .object({
    borrower: z.string().trim().min(1),
    quantity: z.number().int().positive(),
    borrowedOn: date,
    dueBack: date,
  })
  .refine((loan) => loan.dueBack >= loan.borrowedOn, {
    message: 'It is due back on or after the day it was borrowed.',
    path: ['dueBack'],
  });

export const loanCorrectionSchema = z.object({ loan: loanDetailsSchema, version });

/** D-099: the date it came back, which closes the loan. */
export const loanReturnSchema = z.object({ returnedOn: date, version });

export type EquipmentDetailsInput = z.infer<typeof equipmentDetailsSchema>;
export type LoanDetailsInput = z.infer<typeof loanDetailsSchema>;
