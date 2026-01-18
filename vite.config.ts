import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill process.env for the browser
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY || ''),
      YOUTUBE_API_KEY: JSON.stringify(process.env.YOUTUBE_API_KEY || ''),
      HF_API_TOKEN: JSON.stringify(process.env.HF_API_TOKEN || ''),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  server: {
    port: 3000,
  },
});