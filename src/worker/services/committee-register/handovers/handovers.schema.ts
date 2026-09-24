import { z } from 'zod';

const id = z.string().trim().min(1);
const name = z.string().trim().min(1);

export const createHandoverSchema = z.object({
  roleId: id,
  outgoingPersonId: id,
  incomingPersonId: id,
});
export const addHandoverItemSchema = z.object({ nameEn: name, nameAr: name });
export const tickHandoverItemSchema = z.object({ ticked: z.boolean() });

export type CreateHandoverInput = z.infer<typeof createHandoverSchema>;

export interface HandoverItem {
  id: string;
  nameEn: string;
  nameAr: string;
  tickedAt: string | null;
}

export interface HandoverRecord {
  id: string;
  unitId: string;
  roleId: string;
  outgoingPersonId: string;
  incomingPersonId: string;
  outgoingConfirmedAt: string | null;
  incomingConfirmedAt: string | null;
  items: HandoverItem[];
}
