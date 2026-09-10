import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: '/react-account/',
  build: {
    outDir: fileURLToPath(new URL('../../src/main/resources/static/react-account', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    port: 5175,
    proxy: {
      '/api': 'http://localhost:8080',
      '/login': 'http://localhost:8080',
      '/css': 'http://localhost:8080',
      '/images': 'http://localhost:8080',
    },
  },
});
