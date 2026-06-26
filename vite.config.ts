import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig(({ command }) => ({
  plugins: [
    react({
      jsxRuntime: 'classic',
      babel: {
        plugins: command === 'build' ? ['@babel/plugin-transform-react-jsx-source'] : []
      }
    })
  ],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        options: resolve(__dirname, 'options.html'),
        demo: resolve(__dirname, 'demo.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        pageBridgeMain: resolve(__dirname, 'src/content/pageBridgeMain.ts'),
        content: resolve(__dirname, 'src/content/index.ts')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
}));
