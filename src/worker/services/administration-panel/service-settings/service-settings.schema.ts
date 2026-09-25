import { z } from 'zod';

/** A value as sent; the setting's own registered schema checks it (brief 8.1). */
export const setServiceSettingSchema = z.object({
  value: z.unknown(),
  unitId: z.string().min(1).optional(),
});
