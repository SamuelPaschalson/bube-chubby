import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset URLs relative, so the build works from any folder or
// sub-path (Vercel, Netlify, cPanel, GitHub Pages). Routing is hash-based.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist' },
});
