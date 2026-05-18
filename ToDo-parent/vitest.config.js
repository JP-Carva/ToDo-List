import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/database/**', 'src/server.js']
    },
    include: ['**/__tests__/**/*.test.js'],
    globals: true
  }
});
