import { defineConfig } from 'vitest/config';

// T-007: plain Node project for lint-rule tests, file-size and naming checks,
// wrangler config checks and the text-key parity test.
export default defineConfig({
  test: {
    name: 'structure',
    environment: 'node',
    include: ['tests/structure/**/*.test.ts'],
  },
});
