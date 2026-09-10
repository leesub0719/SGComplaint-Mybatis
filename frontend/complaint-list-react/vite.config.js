import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: '/react-complaints/',
  build: {
    outDir: fileURLToPath(new URL('../../src/main/resources/static/react-complaints', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/complaints': 'http://localhost:8080',
      '/css': 'http://localhost:8080',
      '/images': 'http://localhost:8080',
    },
  },
});
