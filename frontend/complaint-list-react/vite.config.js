import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: '/react-mypage/',
  build: {
    outDir: fileURLToPath(new URL('../../src/main/resources/static/react-mypage', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    proxy: {
      // 세션 쿠키를 그대로 넘겨야 하므로 dev 서버에서도 8080으로 프록시한다.
      '/api': 'http://localhost:8080',
      '/login': 'http://localhost:8080',
      '/logout': 'http://localhost:8080',
      '/mypage': 'http://localhost:8080',
      '/css': 'http://localhost:8080',
      '/images': 'http://localhost:8080',
    },
  },
});
