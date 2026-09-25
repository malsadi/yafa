import { z } from 'zod';

/** The chosen alert types; the setting's own schema checks each (brief 8.1). */
export const alertTypesSchema = z.object({ types: z.array(z.string()) });
