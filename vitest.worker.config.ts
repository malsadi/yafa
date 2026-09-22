import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

// T-007: runs in workerd via the Workers Vitest integration. Covers
// tests/core, tests/middleware, tests/api, tests/permissions, tests/integrity.
export default defineConfig({
  plugins: [cloudflareTest({ wrangler: { configPath: './wrangler.jsonc' } })],
  test: {
    name: 'worker',
    include: [
      'tests/core/**/*.test.ts',
      'tests/middleware/**/*.test.ts',
      'tests/api/**/*.test.ts',
      'tests/permissions/**/*.test.ts',
      'tests/integrity/**/*.test.ts',
    ],
  },
});
