import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['app/src/**/*.test.{ts,tsx}'],
    setupFiles: [],
  },
});
