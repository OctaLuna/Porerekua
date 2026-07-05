import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        // maplibre-gl only ships a UMD/CJS bundle (no ESM "default" export).
        // Pre-bundle it so the dev server serves a proper ESM default export;
        // excluding it makes `import maplibregl from 'maplibre-gl'` crash in dev.
        include: ['maplibre-gl'],
      },
    };
});
