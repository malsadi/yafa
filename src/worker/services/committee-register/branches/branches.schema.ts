import { z } from 'zod';

// Letters, digits and hyphens: the code goes into letter reference numbers
// (brief 14 A1), as the seed file spec states (docs/seed-files.md).
const codeSchema = z.string().regex(/^[A-Za-z0-9-]+$/);
const nameSchema = z.string().trim().min(1);
// Brief 25 B1 and D-076: optional until entered; empty means not entered.
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === '' ? null : value))
  .nullable();
const unitDetails = {
  letterheadAddressEn: optionalText.optional(),
  letterheadAddressAr: optionalText.optional(),
  calendarColourId: z.string().min(1).nullable().optional(),
};

export const createBranchSchema = z.object({
  code: codeSchema,
  nameEn: nameSchema,
  nameAr: nameSchema,
  area: nameSchema,
  status: z.enum(['active', 'inactive']),
  ...unitDetails,
});

export const updateUnitSchema = z
  .object({
    code: codeSchema,
    nameEn: nameSchema,
    nameAr: nameSchema,
    area: nameSchema,
    status: z.enum(['active', 'inactive']),
    ...unitDetails,
  })
  .partial();

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;

export type { UnitRecord } from '../../../../shared/committee-register/unit-record';
