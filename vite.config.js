import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const pagesBasePath = process.env.BASE_PATH || process.env.GITHUB_REPOSITORY?.split('/')[1];

export default defineConfig({
  base: pagesBasePath ? `/${pagesBasePath}/` : '/',
  plugins: [react()],
});
