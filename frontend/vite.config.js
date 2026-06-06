import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split large, rarely-changing dependencies into their own long-cached
        // chunks so they aren't re-downloaded when app code changes.
        manualChunks: {
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'socket-vendor': ['socket.io-client'],
          'http-vendor':   ['axios'],
        },
      },
    },
  },
  server: {
    port: 5173,
    // Allow the ThemeEditor to embed pages in an iframe (same origin)
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
    },
    proxy: {
      '/api': {
        target:       'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target:       'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
