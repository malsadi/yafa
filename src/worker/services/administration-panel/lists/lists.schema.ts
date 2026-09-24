import { z } from 'zod';
import { LISTS, type ListKey } from '../../../../shared/administration-panel/lists';

const name = z.string().trim().min(1);

export const listKeySchema = z.enum(LISTS as unknown as [ListKey, ...ListKey[]]);
export const addListItemSchema = z.object({ nameEn: name, nameAr: name });
export const renameListItemSchema = addListItemSchema.partial();

export type AddListItemInput = z.infer<typeof addListItemSchema>;
export type RenameListItemInput = z.infer<typeof renameListItemSchema>;
