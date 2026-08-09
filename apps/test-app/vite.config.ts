import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@metastruct/compiler': path.resolve(__dirname, '../../packages/compiler/dist/index.js'),
      '@metastruct/expression-engine': path.resolve(__dirname, '../../packages/expression-engine/dist/index.js'),
      '@metastruct/meta-core': path.resolve(__dirname, '../../packages/meta-core/dist/index.js'),
      '@metastruct/platform-ui': path.resolve(__dirname, '../../packages/platform-ui/dist/index.js'),
      '@metastruct/studio-ui': path.resolve(__dirname, '../../packages/studio-ui/dist/index.js'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});