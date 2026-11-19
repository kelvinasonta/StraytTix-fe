import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    strictPort: true,
    host: true,
    fs: {
      allow: [
        // Allow serving files from admin-web and the parent project workspace
        path.resolve(__dirname),
        path.resolve(__dirname, '..'),
      ],
      deny: ['.env', '.env.*', '*.{pem,crt}'],
    },
  },
  preview: {
    port: 3001,
    strictPort: true,
    host: true,
  },
});



