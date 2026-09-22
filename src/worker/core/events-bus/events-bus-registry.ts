import type { EventHandler } from './event-handler.type';

const handlers = new Map<string, EventHandler[]>();

/**
 * Registers a reaction to an event a service publishes (brief section 10's
 * integration contract). Event names are plain strings each service's own
 * `events.ts` defines — core never imports a service (brief section 5.3),
 * so there is no shared name enum or pattern validation here, unlike
 * capabilities/settings keys.
 */
export function registerEventHandler(eventName: string, handler: EventHandler): void {
  const existing = handlers.get(eventName) ?? [];
  existing.push(handler);
  handlers.set(eventName, existing);
}

export function listEventHandlers(eventName: string): readonly EventHandler[] {
  return handlers.get(eventName) ?? [];
}

/** Test-only: keeps one test file's registrations from leaking into another. */
export function resetEventsBusForTests(): void {
  handlers.clear();
}
