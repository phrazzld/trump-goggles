import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.js', 'test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['**/node_modules/**', '**/test/**'],
    },
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        runScripts: 'dangerously',
        url: 'https://example.org/',
      },
    },
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  esbuild: {
    // ESBuild for TypeScript transpilation
    target: mode === 'test' ? 'node16' : 'esnext',
    format: 'esm',
  },
}));
