import { z } from 'zod';

/** A browser's push subscription (the Push API's own shape). */
export const subscriptionSchema = z.object({
  endpoint: z.url(),
  expirationTime: z.number().nullable(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

export const endpointSchema = z.object({ endpoint: z.url() });

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
