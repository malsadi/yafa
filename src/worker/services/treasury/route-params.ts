/** A route parameter, for handlers registered in a loop, where Hono can't type its path. */
export function paramOf(
  c: { req: { param: (name: string) => string | undefined } },
  name: string,
): string {
  return c.req.param(name) ?? '';
}
