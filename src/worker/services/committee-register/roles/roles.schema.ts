import { z } from 'zod';
import type { RoleDesignation } from '../../../../shared/committee-register/role-designation';

const nameSchema = z.string().trim().min(1);

export const createRoleSchema = z.object({ nameEn: nameSchema, nameAr: nameSchema });
export const renameRoleSchema = createRoleSchema.partial();

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type RenameRoleInput = z.infer<typeof renameRoleSchema>;

export interface RoleRecord {
  id: string;
  /** Null for a standard role; the branch's unit id for its own extra role. */
  unitId: string | null;
  nameEn: string;
  nameAr: string;
  designation: RoleDesignation | null;
}
