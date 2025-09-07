import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './client/src'),
      },
      {
        find: '@shared',
        replacement: path.resolve(__dirname, './shared'),
      },
      {
        find: '@assets',
        replacement: path.resolve(__dirname, './attached_assets'),
      },
    ],
  },
  root: './client',
  publicDir: './client/public',
  build: {
    outDir: path.resolve(__dirname, 'dist/client'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-slot',
            'class-variance-authority',
            'tailwind-merge',
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '^/api/.*': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
}));
