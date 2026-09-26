import path from 'node:path';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

// T-007: runs in workerd via the Workers Vitest integration. Covers
// tests/core, tests/middleware, tests/api, tests/permissions, tests/integrity,
// tests/shared (src/shared/core is worker-consumed first; workerd's Intl
// behaviour is what matters for money/date formatting called server-side),
// and tests/cron, tests/queues (T-016's dispatchers, mirroring
// src/worker/cron and src/worker/queues — not in T-007's original list,
// since those source folders didn't exist yet when it was written).
// T-071: the Worker's secrets (wrangler.jsonc `secrets.required`) come from
// .dev.vars locally and from nowhere in CI. The test runner loads
// src/worker/index.ts, which parses the publishable key at startup, so
// every worker test failed in CI. Tests always get these fixed, clearly
// fictional values instead — locally too, so a local run matches CI and no
// test ever sees a real key. Tests that verify tokens or webhooks use their
// own throwaway keys (T-064, T-065).
const FICTIONAL_CLERK_SECRETS = {
  // A development-format key (pk_test_ + base64 of the host and `$`, Clerk's
  // own encoding) for a Clerk instance that does not exist.
  CLERK_PUBLISHABLE_KEY: `pk_test_${Buffer.from('fictional-test-instance.clerk.accounts.dev$').toString('base64')}`,
  CLERK_SECRET_KEY: 'sk_test_fictional_not_a_real_key',
  CLERK_WEBHOOK_SIGNING_SECRET: 'whsec_fictional_not_a_real_secret',
};

export default defineConfig(async () => {
  const migrationsPath = path.join(import.meta.dirname, 'migrations');
  const migrations = await readD1Migrations(migrationsPath);

  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          // A test-only binding carrying the Node-read migrations into the
          // worker isolate, where tests/setup/apply-migrations.ts applies them.
          bindings: { TEST_MIGRATIONS: migrations, ...FICTIONAL_CLERK_SECRETS },
        },
      }),
    ],
    test: {
      name: 'worker',
      setupFiles: ['./tests/setup/apply-migrations.ts'],
      include: [
        'tests/core/**/*.test.ts',
        'tests/middleware/**/*.test.ts',
        'tests/api/**/*.test.ts',
        'tests/permissions/**/*.test.ts',
        'tests/integrity/**/*.test.ts',
        'tests/shared/**/*.test.ts',
        'tests/cron/**/*.test.ts',
        'tests/queues/**/*.test.ts',
        'tests/api-me/**/*.test.ts',
        'tests/webhooks/**/*.test.ts',
        'tests/app/**/*.test.ts',
        'tests/privacy-notice/**/*.test.ts',
        'tests/services/**/*.test.ts',
        'tests/api-inbox/**/*.test.ts',
      ],
    },
  };
});
