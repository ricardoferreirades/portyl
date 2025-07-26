import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'example',
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from one level up (the files folder)
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      'portyl': resolve(__dirname, 'dist/index.esm.js'),
    },
  },
  build: {
    outDir: '../example-dist',
    emptyOutDir: true,
  },
  publicDir: false, // Don't copy public files to avoid conflicts
  assetsInclude: ['**/*.tif', '**/*.tiff'], // Include TIFF files as assets
});
