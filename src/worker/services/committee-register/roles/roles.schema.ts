import { z } from 'zod';

const nameSchema = z.string().trim().min(1);

export const createRoleSchema = z.object({ nameEn: nameSchema, nameAr: nameSchema });
export const renameRoleSchema = createRoleSchema.partial();

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type RenameRoleInput = z.infer<typeof renameRoleSchema>;

export type { RoleRecord } from '../../../../shared/committee-register/role-record';
