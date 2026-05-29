import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
