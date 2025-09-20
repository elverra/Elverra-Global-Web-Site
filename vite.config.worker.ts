/// <reference types="vite/client" />

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'worker/[name].js',
        chunkFileNames: 'worker/[name].js',
        assetFileNames: 'worker/[name].[ext]',
      },
    },
  },
});
