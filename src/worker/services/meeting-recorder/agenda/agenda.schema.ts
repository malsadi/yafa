import { z } from 'zod';

/** D-204: an agenda item's title and optional note. */
export const agendaItemSchema = z.object({
  title: z.string().trim().min(1),
  note: z
    .string()
    .trim()
    .transform((text) => (text === '' ? null : text))
    .nullable()
    .default(null),
});

export const agendaItemSaveSchema = z.object({
  item: agendaItemSchema,
  version: z.number().int().positive(),
});

/** D-204: the whole agenda's order, before the meeting. */
export const agendaOrderSchema = z.object({ itemIds: z.array(z.string().min(1)).min(1) });

export type AgendaItemInput = z.infer<typeof agendaItemSchema>;
