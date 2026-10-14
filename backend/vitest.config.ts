import path from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: '.',
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    pool: 'forks',
    clearMocks: true,
    restoreMocks: true,
  },
  plugins: [swc.vite({ swcrc: false, module: { type: 'es6' } })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
