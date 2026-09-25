import { z } from 'zod';

/** A setting's value as sent; its own registered schema checks it (brief 8.1). */
export const requiredSettingValueSchema = z.object({ value: z.unknown() });
