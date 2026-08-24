import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Path aliases here MUST mirror the `paths` map in tsconfig.app.json.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // host: true exposes the dev server on the local network (prints a Network URL),
  // so other devices on the same Wi-Fi can open it via your machine's LAN IP.
  server: {
    host: true,
    port: 5173,
    // Uploaded-file URLs from the API are relative ("/api/upload/file/…") so
    // they resolve correctly in production behind a shared origin. In dev
    // the frontend and backend are different ports, so plain <img>/<a> tags
    // (which don't go through apiClient's baseURL) need this proxy to reach
    // the real backend instead of 404ing against the Vite dev server itself.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        // Isolate the stable framework core into its own hashed chunks so returning
        // visitors reuse them across redeploys instead of re-downloading the whole
        // bundle whenever app code changes. Deliberately narrow: everything else
        // (lucide icons, feature code) keeps Rollup's default per-route splitting.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
              return 'vendor-react';
            }
            if (/[\\/]node_modules[\\/](@reduxjs|react-redux|redux|immer|reselect)[\\/]/.test(id)) {
              return 'vendor-redux';
            }
            if (/[\\/]node_modules[\\/]react-router/.test(id)) {
              return 'vendor-router';
            }
          }
        },
      },
    },
  },
});
