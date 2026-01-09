import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['api/**/*.test.ts'],
    testTimeout: 30000,
    setupFiles: [],
    reporters: ['verbose'],
  },
});
