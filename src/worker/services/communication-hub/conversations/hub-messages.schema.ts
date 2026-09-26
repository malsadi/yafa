import { z } from 'zod';

/** A message's text. */
export const messageSchema = z.object({ body: z.string().trim().min(1) });
