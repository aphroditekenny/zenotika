#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

const BUILD_DIR = path.join(process.cwd(), 'build', 'assets');
const LIMIT_KB = Number(process.env.BUNDLE_LIMIT_KB || 250);
const PER_FILE_LIMITS = (process.env.BUNDLE_FILE_LIMITS || '').split(',').map((pair) => {
  const [name, kb] = pair.split(':');
  return name && kb ? { name, limitKb: Number(kb) } : null;
}).filter(Boolean);

function formatKb(bytes) {
  return (bytes / 1024).toFixed(2);
}

if (!fs.existsSync(BUILD_DIR)) {
  console.error(`Bundle check failed: directory ${BUILD_DIR} not found. Run "npm run build" first.`);
  process.exit(1);
}

const bundleFiles = fs
  .readdirSync(BUILD_DIR)
  .filter((file) => file.endsWith('.js'))
  .map((file) => path.join(BUILD_DIR, file));

if (bundleFiles.length === 0) {
  console.error('Bundle check failed: no JavaScript bundles found in build/assets.');
  process.exit(1);
}

let hasViolation = false;
let largest = { file: '', size: 0 };

bundleFiles.forEach((filePath) => {
  const buffer = fs.readFileSync(filePath);
  const gzippedSize = gzipSync(buffer).length;

  if (gzippedSize > largest.size) {
    largest = { file: path.basename(filePath), size: gzippedSize };
  }

  if (gzippedSize > LIMIT_KB * 1024) {
    console.error(
      `Bundle size violation: ${path.basename(filePath)} is ${formatKb(gzippedSize)} kB gzip (limit ${LIMIT_KB} kB).`
    );
    hasViolation = true;
  }

  // Optional per-file budgets
  const basename = path.basename(filePath);
  PER_FILE_LIMITS.forEach(({ name, limitKb }) => {
    if (basename.includes(name) && gzippedSize > limitKb * 1024) {
      console.error(
        `Bundle size violation (${name}): ${basename} is ${formatKb(gzippedSize)} kB gzip (limit ${limitKb} kB).`
      );
      hasViolation = true;
    }
  });
});

if (hasViolation) {
  process.exit(1);
}

console.log(
  `Bundle size check passed. Largest gzip bundle (${largest.file}) is ${formatKb(largest.size)} kB (limit ${LIMIT_KB} kB).`
);
