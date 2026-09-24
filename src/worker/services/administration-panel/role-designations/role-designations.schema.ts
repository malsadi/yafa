import { z } from 'zod';
import {
  ROLE_DESIGNATIONS,
  type RoleDesignation,
} from '../../../../shared/committee-register/role-designation';

export const setDesignationSchema = z.object({
  designation: z.enum(ROLE_DESIGNATIONS as [RoleDesignation, ...RoleDesignation[]]),
  roleId: z.string().min(1).nullable(),
});

export type SetDesignationInput = z.infer<typeof setDesignationSchema>;
