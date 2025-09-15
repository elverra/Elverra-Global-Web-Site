import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: env.VITE_BASE_URL || '/',
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@assets": path.resolve(__dirname, "./public"),
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
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  };
});
