import { routeDeclarationSchema, type RouteDeclaration } from './route-access.schema';

const routes: RouteDeclaration[] = [];

/**
 * Registers a route's access declaration so the permission sweep (brief
 * section 7.4) can enumerate every route the portal exposes. Every route
 * calls this exactly once; a route that never does fails the sweep.
 */
export function registerRoute(declaration: RouteDeclaration): void {
  const parsed = routeDeclarationSchema.parse(declaration);
  const isDuplicate = routes.some(
    (existing) => existing.method === parsed.method && existing.path === parsed.path,
  );
  if (isDuplicate) {
    throw new Error(`Route already registered: ${parsed.method} ${parsed.path}`);
  }
  routes.push(parsed);
}

/** Returns every route registered so far. Used by the permission sweep. */
export function listRegisteredRoutes(): readonly RouteDeclaration[] {
  return routes;
}

/**
 * Clears the registry. Test-only: keeps fixture routes from one test file
 * leaking into another that shares the same module instance.
 */
export function resetRegistryForTests(): void {
  routes.length = 0;
}
