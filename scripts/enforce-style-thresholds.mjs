#!/usr/bin/env node
/**
 * enforce-style-thresholds.mjs
 * Fails (non-zero exit) if style reports exceed thresholds.
 */
import { readFileSync } from 'node:fs';

// Ratcheted thresholds (phase 3): tightening raw hex and enforcing zero unguarded keyframes.
// History: RAW_HEX_LIMIT 140 -> 120 -> 100 -> 70 -> 50 (current) ; next planned < 40 after brand + legacy color consolidation.
//          UNGUARDED_LIMIT 67 -> 45 -> 5 -> 0 (current enforced steady-state).
const RAW_HEX_LIMIT = parseInt(process.env.RAW_HEX_LIMIT || '40', 10);
const UNGUARDED_LIMIT = parseInt(process.env.UNGUARDED_LIMIT || '0', 10);

function countLines(file, predicate) {
  try {
    return readFileSync(file, 'utf8').split(/\r?\n/).filter(predicate).length;
  } catch { return 0; }
}

// More robust: trim, ensure line begins with hex and not a header, and capture only first column.
const rawHexCount = countLines('color-report.txt', l => {
  const t = l.trim();
  if (!t || t.startsWith('=') || t.toLowerCase().startsWith('raw hex')) return false;
  return /^#[0-9a-f]{3,8}\b/i.test(t);
});

if (process.env.DEBUG_THRESHOLDS === '1') {
  try {
    const lines = readFileSync('color-report.txt','utf8').split(/\r?\n/).filter(l=>/^#[0-9a-f]{3,8}\b/i.test(l.trim())).slice(0,5);
    console.log('[debug] sample hex lines:', lines);
  } catch {}
}
const unguarded = countLines('keyframe-report.txt', l => /UNGUARDED/.test(l));

console.log(`Raw hex count: ${rawHexCount} (limit ${RAW_HEX_LIMIT})`);
console.log(`Unguarded keyframes: ${unguarded} (limit ${UNGUARDED_LIMIT})`);

let failed = false;
if (rawHexCount > RAW_HEX_LIMIT) { console.error(`❌ Hex color usage (${rawHexCount}) exceeds tightened limit (${RAW_HEX_LIMIT})`); failed = true; }
if (unguarded > UNGUARDED_LIMIT) { console.error(`❌ Unguarded keyframes (${unguarded}) exceed tightened limit (${UNGUARDED_LIMIT})`); failed = true; }

if (failed) process.exit(1);
console.log('✅ Style thresholds within tightened limits');
