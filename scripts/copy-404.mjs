import { copyFile, access, constants } from 'node:fs/promises';
import { resolve } from 'node:path';

async function main() {
  const buildDir = resolve(process.cwd(), 'build');
  const indexHtml = resolve(buildDir, 'index.html');
  const notFoundHtml = resolve(buildDir, '404.html');
  try {
    await access(indexHtml, constants.R_OK);
    await copyFile(indexHtml, notFoundHtml);
    console.log('Created SPA fallback 404.html for GitHub Pages.');
  } catch (err) {
    console.error('Failed to create 404.html fallback:', err);
    process.exitCode = 1;
  }
}

main();
