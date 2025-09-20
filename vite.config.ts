import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement en fonction du mode (dev/prod)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    base: env.VITE_BASE_URL || '/',
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@assets": path.resolve(__dirname, "./public"),
        'lodash': 'lodash-es',
      },
    },
    define: {
      'process.env': {}
    },
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/health': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      },
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: true,
      chunkSizeWarningLimit: 1000, // Augmente la limite d'avertissement
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot'],
            form: ['react-hook-form', '@hookform/resolvers', 'zod'],
            utils: ['date-fns', 'lodash-es', 'axios'],
            vendor: ['@supabase/supabase-js', '@tanstack/react-query']
          }
        }
      },
      assetsDir: 'assets',
      copyPublicDir: true,
    },
    // Ensure public directory is properly handled
    publicDir: 'public',
  };
});
