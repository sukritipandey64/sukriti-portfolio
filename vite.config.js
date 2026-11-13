import { defineConfig } from 'vite';
import { resolve } from 'path';

// Multi-page build: every case study is its own HTML entry.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        velocity: resolve(__dirname, 'velocity-ai.html'),
        barista: resolve(__dirname, 'digital-barista.html'),
        curator: resolve(__dirname, 'curator.html'),
        editorial: resolve(__dirname, 'editorial.html'),
      },
    },
  },
});
