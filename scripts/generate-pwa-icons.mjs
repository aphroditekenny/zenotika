#!/usr/bin/env node
import { PNG } from 'pngjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 14, g: 165, b: 233 };
}

function drawCircle(png, cx, cy, radius, color) {
  const { r, g, b } = color;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        const idx = (png.width * y + x) << 2;
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = 255;
      }
    }
  }
}

function fillRect(png, color) {
  const { r, g, b } = color;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }
}

function generateIcon(size, { bg = '#0ea5e9', fg = '#0b1220', maskable = false } = {}) {
  const png = new PNG({ width: size, height: size });
  fillRect(png, hexToRgb(bg));
  // Simple centered circle mark for contrast
  const radius = Math.round(size * (maskable ? 0.36 : 0.32));
  drawCircle(png, Math.floor(size / 2), Math.floor(size / 2), radius, hexToRgb(fg));
  return PNG.sync.write(png);
}

function main() {
  const outDir = resolve(process.cwd(), 'public');
  mkdirSync(outDir, { recursive: true });

  const files = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'pwa-512x512-maskable.png', size: 512, maskable: true },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const f of files) {
    const buf = generateIcon(f.size, { maskable: Boolean(f.maskable) });
    writeFileSync(resolve(outDir, f.name), buf);
    console.log('Generated', f.name);
  }

  // Minimal SVG favicon for crisp scaling in tabs
  const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#0ea5e9"/>
  <circle cx="32" cy="32" r="18" fill="#0b1220"/>
  <title>Zenotika</title>
</svg>`;
  writeFileSync(resolve(outDir, 'favicon.svg'), faviconSvg, 'utf8');
  console.log('Generated favicon.svg');
}

main();
