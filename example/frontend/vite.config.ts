import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/portyl/', // Set to your repo name for GitHub Pages
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      'portyl': resolve(__dirname, '../../dist/index.esm.js'),
    },
  },
  publicDir: false,
  assetsInclude: ['**/*.tif', '**/*.tiff'],
});
