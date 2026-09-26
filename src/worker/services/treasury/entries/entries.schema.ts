import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const text = z.string().trim().min(1);

/** Brief 9.3: an uploaded receipt photo, to be recorded with its entry. */
export const receiptUploadSchema = z.object({
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

/**
 * Brief 17 B1, B2, B4 and P10: a credit (money in, from its source) or a
 * debit (money out, paid to), with its description, its receipt photos, and
 * in an event account, perhaps a budget line. `entryId` is the one its
 * receipts were uploaded under, if any.
 */
export const moneyEntrySchema = z.object({
  entryId: z.string().min(1).optional(),
  accountId: z.string().min(1),
  amountPence: z.number().int().positive(),
  entryDate: date,
  counterparty: text,
  description: text,
  budgetLineId: z.string().min(1).nullable().default(null),
  receipts: z.array(receiptUploadSchema).default([]),
});

/** Brief 17 B3 and D-122: money moved from one of the unit's open accounts to another. */
export const transferSchema = z
  .object({
    accountId: z.string().min(1),
    toAccountId: z.string().min(1),
    amountPence: z.number().int().positive(),
    entryDate: date,
    description: text,
  })
  .refine((t) => t.accountId !== t.toAccountId, {
    message: 'Two different accounts.',
    path: ['toAccountId'],
  });

export const entryPeriodSchema = z.object({ from: date.optional(), to: date.optional() });

export type MoneyEntry = z.infer<typeof moneyEntrySchema>;
export type Transfer = z.infer<typeof transferSchema>;
export type ReceiptUpload = z.infer<typeof receiptUploadSchema>;
