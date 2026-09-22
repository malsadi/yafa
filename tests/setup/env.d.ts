import type { D1Migration } from 'cloudflare:test';

// TEST_MIGRATIONS is a test-only binding injected via vitest.worker.config.ts's
// miniflare.bindings, not a real wrangler.jsonc binding, so `wrangler types`
// never generates it. This augments the generated Env for test code only.
declare global {
  namespace Cloudflare {
    interface Env {
      TEST_MIGRATIONS: D1Migration[];
    }
  }
}

export {};
