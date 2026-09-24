import { defineConfig } from 'vitest/config';

// T-072: the opt-in core/pdf check, run in Node with `npm run test:pdf-remote`.
// Not a project in vitest.config.ts, so `npm test` and CI never call the
// paid Browser Rendering service (D-030).
export default defineConfig({
  test: {
    name: 'pdf-remote',
    environment: 'node',
    include: ['tests/pdf-remote/**/*.test.ts'],
    testTimeout: 180_000,
    hookTimeout: 180_000,
    fileParallelism: false,
  },
});
