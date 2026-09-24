import { env } from 'cloudflare:workers';
import { buildApp } from './app/build-app';
import { createClerkAccounts } from './clerk';
import { registerCronJobs } from './cron';
import { handleScheduled } from './app/handle-scheduled';

/**
 * The Worker entry point (brief section 5.4: "Hono app assembly only").
 * `env` comes from `cloudflare:workers` so the app is assembled once per
 * isolate, not per request; nothing about permissions is cached (brief
 * section 6.3) — every route still loads its own request context.
 */
registerCronJobs();
const app = buildApp(
  env,
  { secretKey: env.CLERK_SECRET_KEY },
  createClerkAccounts(env.CLERK_SECRET_KEY),
);

export default {
  fetch: app.fetch,
  scheduled: handleScheduled,
} satisfies ExportedHandler<Env>;
