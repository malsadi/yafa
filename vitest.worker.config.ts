import path from 'node:path';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

// T-007: runs in workerd via the Workers Vitest integration. Covers
// tests/core, tests/middleware, tests/api, tests/permissions, tests/integrity,
// tests/shared (src/shared/core is worker-consumed first; workerd's Intl
// behaviour is what matters for money/date formatting called server-side).
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
          bindings: { TEST_MIGRATIONS: migrations },
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
      ],
    },
  };
});
