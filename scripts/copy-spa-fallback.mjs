import { copyFileSync, existsSync } from 'node:fs';

const indexPath = 'dist/index.html';
const fallbackPath = 'dist/404.html';

if (!existsSync(indexPath)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

copyFileSync(indexPath, fallbackPath);
console.log('Created dist/404.html for SPA routing on Vercel.');
