import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const text = z.string().trim().min(1);

/** Brief 14 B1: name, email and phone (D-053), role and start date. */
export const addOfficerSchema = z
  .object({
    name: text,
    email: z.email().transform((email) => email.trim().toLowerCase()),
    phone: text,
    roleId: text,
    startDate: isoDate,
    endDate: isoDate.nullable().optional(),
  })
  .refine((input) => !input.endDate || input.endDate > input.startDate, {
    message: 'endDate must be after startDate',
  });

export const updatePersonSchema = z.object({ name: text, phone: text }).partial();

export const endTermSchema = z.object({ endDate: isoDate });

export type AddOfficerInput = z.infer<typeof addOfficerSchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;

export interface OfficerRecord {
  termId: string;
  personId: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  roleNameEn: string;
  roleNameAr: string;
  startDate: string;
  endDate: string | null;
}
