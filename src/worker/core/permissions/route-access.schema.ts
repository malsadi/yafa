import { z } from 'zod';

// Capabilities are named "<service>.<resource>.<action>" (brief section 5.1).
// Exported so the capability catalogue (capability-catalogue.schema.ts)
// validates registered capability names against the same pattern.
export const CAPABILITY_PATTERN = /^[a-z][a-z-]*\.[a-z][a-z-]*\.[a-z][a-z-]*$/;

// D-004: exactly these four route classes may declare something other than
// a capability. D-025 answered O-004: the PWA manifest route is public with
// no access class at all — not a fifth kind here — so when it's built, it
// simply never calls registerRoute(). D-040 adds one more class the owner
// asked for: the public build progress page — build progress only, never
// the database, not indexed by search engines.
const routeAccessSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('capability'), capability: z.string().regex(CAPABILITY_PATTERN) }),
  z.object({ kind: z.literal('signed-in-only') }),
  z.object({ kind: z.literal('signed-webhook') }),
  z.object({ kind: z.literal('calendar-feed-token') }),
  z.object({ kind: z.literal('public-progress-page') }),
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
