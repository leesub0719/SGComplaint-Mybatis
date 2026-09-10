import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: '/react-complaint-new/',
  build: {
    outDir: fileURLToPath(new URL('../../src/main/resources/static/react-complaint-new', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    port: 5176,
    proxy: {
      // 로그인 세션 쿠키와 첨부파일 업로드를 그대로 넘기기 위해 8080으로 프록시한다.
      '/api': 'http://localhost:8080',
      '/complaints': 'http://localhost:8080',
      '/login': 'http://localhost:8080',
      '/images': 'http://localhost:8080',
      '/css': 'http://localhost:8080',
    },
  },
});
