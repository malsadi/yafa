import { z } from 'zod';
import { PERMISSION_SCOPES } from '../../../../shared/core/permission-scope';

const scopeSchema = z.enum(PERMISSION_SCOPES as [string, ...string[]]);

/** One cell: every scope a role holds a capability at; empty removes it. */
export const setCellSchema = z.object({
  roleId: z.string().min(1),
  capability: z.string().min(1),
  scopes: z.array(scopeSchema),
  expectedVersion: z.number().int().min(0),
});

export const restoreVersionSchema = z.object({ expectedVersion: z.number().int().min(0) });

export type SetCellInput = z.infer<typeof setCellSchema>;
