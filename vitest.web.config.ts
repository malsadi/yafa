import { defineConfig } from 'vitest/config';

// T-007: jsdom project for the React frontend. The Workers Vitest plugin does
// not support custom environments, which is why this needs its own project.
export default defineConfig({
  test: {
    name: 'web',
    environment: 'jsdom',
    include: ['tests/web/**/*.test.ts', 'tests/web/**/*.test.tsx'],
  },
});
