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

export type {
  HandoverItem,
  HandoverRecord,
} from '../../../../shared/committee-register/handover-record';

/** The columns a new handover is stored with; names come from their own tables. */
export interface NewHandover {
  id: string;
  unitId: string;
  roleId: string;
  outgoingPersonId: string;
  incomingPersonId: string;
}
