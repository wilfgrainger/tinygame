import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'baseline-widely-available',
    sourcemap: true,
    assetsDir: 'assets'
  },
  server: {
    host: '127.0.0.1',
    port: 5173
  }
});
