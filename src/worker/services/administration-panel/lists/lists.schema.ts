import { z } from 'zod';
import { LISTS, type ListKey } from '../../../../shared/administration-panel/lists';

const name = z.string().trim().min(1);
// D-076: a calendar colour's value, #RRGGBB.
const colour = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const listKeySchema = z.enum(LISTS as unknown as [ListKey, ...ListKey[]]);
export const addListItemSchema = z.object({
  nameEn: name,
  nameAr: name,
  colour: colour.optional(),
});
export const renameListItemSchema = addListItemSchema.partial();
export const orderListSchema = z.object({ itemIds: z.array(z.string().min(1)).min(1) });

export type AddListItemInput = z.infer<typeof addListItemSchema>;
export type RenameListItemInput = z.infer<typeof renameListItemSchema>;
