import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/') || id.includes('node_modules/scheduler/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/socket.io-client/') || id.includes('node_modules/engine.io-client/') || id.includes('node_modules/socket.io-parser/')) {
            return 'socket-vendor';
          }
          if (id.includes('node_modules/axios/')) {
            return 'http-vendor';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons-vendor';
          }
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
