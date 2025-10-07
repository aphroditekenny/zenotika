#!/usr/bin/env node
/**
 * enforce-style-thresholds.mjs
 * Fails (non-zero exit) if style reports exceed thresholds.
 */
import { readFileSync } from 'node:fs';

// Ratcheted thresholds (phase 2). Next planned: RAW_HEX_LIMIT < 40, UNGUARDED_LIMIT -> 0.
const RAW_HEX_LIMIT = parseInt(process.env.RAW_HEX_LIMIT || '100', 10); // was 140 -> 120 -> 100
const UNGUARDED_LIMIT = parseInt(process.env.UNGUARDED_LIMIT || '5', 10); // was 67 -> 45 -> 5

function countLines(file, predicate) {
  try {
    return readFileSync(file, 'utf8').split(/\r?\n/).filter(predicate).length;
  } catch { return 0; }
}

const rawHexCount = countLines('color-report.txt', l => /^#[0-9a-f]{3,8}/i.test(l));
const unguarded = countLines('keyframe-report.txt', l => /UNGUARDED/.test(l));

console.log(`Raw hex count: ${rawHexCount} (limit ${RAW_HEX_LIMIT})`);
console.log(`Unguarded keyframes: ${unguarded} (limit ${UNGUARDED_LIMIT})`);

let failed = false;
if (rawHexCount > RAW_HEX_LIMIT) { console.error(`❌ Hex color usage (${rawHexCount}) exceeds tightened limit (${RAW_HEX_LIMIT})`); failed = true; }
if (unguarded > UNGUARDED_LIMIT) { console.error(`❌ Unguarded keyframes (${unguarded}) exceed tightened limit (${UNGUARDED_LIMIT})`); failed = true; }

if (failed) process.exit(1);
console.log('✅ Style thresholds within tightened limits');
