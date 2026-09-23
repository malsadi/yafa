export type CronJobHandler = (env: Env) => Promise<void>;

const handlers = new Map<string, CronJobHandler>();

/**
 * Registers one scheduled job by name (brief section 11). Empty in Phase 0
 * (T-016) — each job file (`src/worker/cron/<job>.ts`) registers itself in
 * the phase that owns it. Exactly one handler per name: a cron job either
 * runs or it doesn't, unlike an event a service can react to from several
 * places (`core/events-bus`).
 */
export function registerCronJob(name: string, handler: CronJobHandler): void {
  if (handlers.has(name)) {
    throw new Error(`Cron job already registered: ${name}`);
  }
  handlers.set(name, handler);
}

export function getCronJobHandler(name: string): CronJobHandler | undefined {
  return handlers.get(name);
}

/** Test-only: keeps one test file's registrations from leaking into another. */
export function resetCronJobRegistryForTests(): void {
  handlers.clear();
}
