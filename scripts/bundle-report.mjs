#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUILD_ASSETS = join(process.cwd(), 'build', 'assets');
const REPORTS_DIR = join(process.cwd(), 'reports');
const OUT_FILE = join(REPORTS_DIR, 'bundle-report.json');

function formatKb(bytes) {
  return Number((bytes / 1024).toFixed(2));
}

function getFiles() {
  try {
    const files = readdirSync(BUILD_ASSETS);
    return files.filter((f) => /\.(js|css)$/.test(f)).map((f) => join(BUILD_ASSETS, f));
  } catch (e) {
    console.error(`Build assets directory not found: ${BUILD_ASSETS}. Run a build first.`);
    process.exit(1);
  }
}

async function main() {
  const files = getFiles();
  if (files.length === 0) {
    console.error('No .js or .css files found in build/assets');
    process.exit(1);
  }

  const entries = files.map((fp) => {
    const buf = readFileSync(fp);
    const gz = gzipSync(buf);
    return {
      file: basename(fp),
      sizeBytes: buf.length,
      sizeKb: formatKb(buf.length),
      gzipBytes: gz.length,
      gzipKb: formatKb(gz.length),
    };
  });

  const largestGzip = entries.reduce((a, b) => (a.gzipBytes > b.gzipBytes ? a : b));

  const report = {
    timestamp: new Date().toISOString(),
    assetsDir: BUILD_ASSETS,
    summary: {
      count: entries.length,
      largestGzip: {
        file: largestGzip.file,
        gzipKb: largestGzip.gzipKb,
      },
      totalGzipKb: formatKb(entries.reduce((n, e) => n + e.gzipBytes, 0)),
      totalRawKb: formatKb(entries.reduce((n, e) => n + e.sizeBytes, 0)),
    },
    files: entries.sort((a, b) => b.gzipBytes - a.gzipBytes),
  };

  await mkdir(REPORTS_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(report, null, 2), 'utf8');
  console.log(`→ Bundle report written to ${OUT_FILE}`);
  console.log('→ Largest gzip bundle:', report.summary.largestGzip);
}

main().catch((err) => {
  console.error('Bundle report failed:', err?.message || err);
  process.exitCode = 1;
});
