import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: '/app/',
  build: {
    outDir: fileURLToPath(new URL('../../src/main/resources/static/app', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/complaints': 'http://localhost:8080',
      '/mypage': 'http://localhost:8080',
      '/admin': 'http://localhost:8080',
      '/login': 'http://localhost:8080',
      '/logout': 'http://localhost:8080',
      '/css': 'http://localhost:8080',
      '/images': 'http://localhost:8080',
    },
  },
});
