import { z } from 'zod';

// Capabilities are named "<service>.<resource>.<action>" (brief section 5.1).
const CAPABILITY_PATTERN = /^[a-z][a-z-]*\.[a-z][a-z-]*\.[a-z][a-z-]*$/;

// D-004: exactly these four route classes may declare something other than
// a capability. A fifth, "public" (for the PWA manifest, O-004), is not
// confirmed yet and is deliberately not accepted here.
const routeAccessSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('capability'), capability: z.string().regex(CAPABILITY_PATTERN) }),
  z.object({ kind: z.literal('signed-in-only') }),
  z.object({ kind: z.literal('signed-webhook') }),
  z.object({ kind: z.literal('calendar-feed-token') }),
]);

const httpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

export const routeDeclarationSchema = z.object({
  method: httpMethodSchema,
  path: z.string().startsWith('/'),
  access: routeAccessSchema,
});

export type RouteAccess = z.infer<typeof routeAccessSchema>;
export type RouteAccessClass = RouteAccess['kind'];
export type RouteDeclaration = z.infer<typeof routeDeclarationSchema>;
