import { z } from 'zod';

/** On, off, or null to return a unit to the portal-wide value. */
export const changeServiceSwitchSchema = z.object({
  enabled: z.boolean().nullable(),
  unitId: z.string().min(1).optional(),
});
