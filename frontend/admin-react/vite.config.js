import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: '/react-admin/',
  build: {
    outDir: fileURLToPath(new URL('../../src/main/resources/static/react-admin', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    port: 5177,
    proxy: {
      '/api': 'http://localhost:8080',
      '/admin': 'http://localhost:8080',
      '/login': 'http://localhost:8080',
      '/logout': 'http://localhost:8080',
      '/images': 'http://localhost:8080',
    },
  },
});
