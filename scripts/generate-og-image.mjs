#!/usr/bin/env node
/**
 * OG image generator (SVG + raster PNG via sharp). Falls back to tiny placeholder when sharp unavailable.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { get as httpsGet } from 'node:https';
// Avoid direct TS imports (script runs pre-build). We extract minimal data via regex fallback.
let persona = { brand: 'Zenotika', tagline: 'Mindful balance, modern energy, intelligent function.', pillars: [] };
let defaultMeta = { description: 'Zenotika – React 19 progressive web experience berfokus pada performa, aksesibilitas, dan desain berniat baik.' };
try {
    const pSrc = readFileSync(resolve(process.cwd(), 'src/content/persona.ts'), 'utf8');
    const taglineMatch = pSrc.match(/tagline:\s*'([^']+)'/);
    if (taglineMatch) persona.tagline = taglineMatch[1];
    const pillarsMatch = pSrc.match(/pillars:\s*\[(.*?)\]\s*,\s*keywords/s);
    if (pillarsMatch) {
        const items = pillarsMatch[1].split(/},/).map(s => s.trim().endsWith('}') ? s : s + '}').filter(s => /title:/.test(s));
        persona.pillars = items.map(raw => {
            const title = (raw.match(/title:\s*'([^']+)'/) || [])[1];
            const short = (raw.match(/short:\s*'([^']+)'/) || [])[1];
            return { title, short };
        }).filter(p => p.title && p.short).slice(0, 3);
    }
} catch { }
try {
    const mSrc = readFileSync(resolve(process.cwd(), 'src/content/meta.ts'), 'utf8');
    const descMatch = mSrc.match(/description:\s*'([^']+)'/);
    if (descMatch) defaultMeta.description = descMatch[1];
} catch { }
let sharpAvailable = true; let sharp;
try { sharp = (await import('sharp')).default; } catch { sharpAvailable = false; }

// Optional Satori (dynamic React-like layout to SVG). If unavailable we fall back.
let satoriAvailable = true; let satori;
try { satori = (await import('satori')).default; } catch { satoriAvailable = false; }
// Satori currently cannot parse WOFF2 variable fonts (Unsupported OpenType signature wOF2),
// so we fetch / embed standard TTF weights (Regular 400, Bold 700). Cache locally once downloaded.
let interRegular = null; let interBold = null; let satoriFontName = 'Inter';
let fallbackRegular = null; let fallbackBold = null;
import { mkdirSync } from 'node:fs';
function ensureDir(p) { try { mkdirSync(p, { recursive: true }); } catch { } }
try { interRegular = readFileSync(resolve(process.cwd(), 'public/fonts/Inter-Regular.ttf')); } catch { }
try { interBold = readFileSync(resolve(process.cwd(), 'public/fonts/Inter-Bold.ttf')); } catch { }
try { fallbackRegular = readFileSync(resolve(process.cwd(), 'public/fonts/NotoSans-Regular.ttf')); } catch {}
try { fallbackBold = readFileSync(resolve(process.cwd(), 'public/fonts/NotoSans-Bold.ttf')); } catch {}
if (!interRegular || !interBold) {
    const fontsourceDir = resolve(process.cwd(), 'node_modules/@fontsource/inter/files');
    try {
        const { decompress } = await import('wawoff2');
        if (!interRegular) {
            const woff2Path = resolve(fontsourceDir, 'inter-latin-400-normal.woff2');
            const woff2Buf = readFileSync(woff2Path);
            const ttf = await decompress(woff2Buf);
            interRegular = Buffer.from(ttf);
            const fontsDir = resolve(process.cwd(), 'public/fonts');
            ensureDir(fontsDir);
            writeFileSync(resolve(fontsDir, 'Inter-Regular.ttf'), interRegular);
            console.log('Converted Inter-Regular.woff2 from @fontsource/inter to TTF.');
        }
        if (!interBold) {
            const woff2Path = resolve(fontsourceDir, 'inter-latin-700-normal.woff2');
            const woff2Buf = readFileSync(woff2Path);
            const ttf = await decompress(woff2Buf);
            interBold = Buffer.from(ttf);
            const fontsDir = resolve(process.cwd(), 'public/fonts');
            ensureDir(fontsDir);
            writeFileSync(resolve(fontsDir, 'Inter-Bold.ttf'), interBold);
            console.log('Converted Inter-Bold.woff2 from @fontsource/inter to TTF.');
        }
    } catch (error) {
        if (error && (error.code === 'ENOENT' || /ConvertWOFF2ToTTF/.test(String(error)))) {
            // silently continue to other fallbacks
        } else if (error) {
            console.warn('Failed to convert @fontsource/inter woff2 fonts', error instanceof Error ? error.message : error);
        }
    }
}
if (!interRegular || !interBold) {
    const typefaceDir = resolve(process.cwd(), 'node_modules/typeface-inter');
    try {
        const roman = readFileSync(resolve(typefaceDir, 'Inter Variable/Single axis/Inter-roman.ttf'));
        const fontsDir = resolve(process.cwd(), 'public/fonts');
        ensureDir(fontsDir);
        if (!interRegular) {
            interRegular = roman;
            writeFileSync(resolve(fontsDir, 'Inter-Regular.ttf'), roman);
            console.log('Loaded Inter-Regular.ttf from typeface-inter.');
        }
        if (!interBold) {
            interBold = roman;
            writeFileSync(resolve(fontsDir, 'Inter-Bold.ttf'), roman);
            console.log('Reused typeface-inter Inter-roman.ttf for Inter-Bold.ttf.');
        }
    } catch { }
}
async function downloadFont(url) {
    if (typeof fetch === 'function') {
        try {
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                const arrayBuffer = await res.arrayBuffer();
                return Buffer.from(new Uint8Array(arrayBuffer));
            }
            throw new Error(`HTTP ${res.status}`);
        } catch (error) {
            console.warn('Fetch failed for', url, 'falling back to HTTPS request', error instanceof Error ? error.message : error);
        }
    }
    return new Promise((resolvePromise, rejectPromise) => {
        httpsGet(url, (res) => {
            if (res.statusCode && res.statusCode >= 400) {
                rejectPromise(new Error(`HTTP ${res.statusCode}`));
                res.resume();
                return;
            }
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolvePromise(Buffer.concat(chunks)));
        }).on('error', rejectPromise);
    });
}

if (!interRegular || !interBold) {
    const fontSources = new Map([
        ['Inter-Regular.ttf', [
            'https://rsms.me/inter/font-files/Inter-Regular.ttf',
            'https://raw.githubusercontent.com/rsms/inter/master/fonts/ttf/Inter-Regular.ttf',
            'https://cdn.jsdelivr.net/gh/rsms/inter@4.0/fonts/ttf/Inter-Regular.ttf'
        ]
        ],
        ['Inter-Bold.ttf', [
            'https://rsms.me/inter/font-files/Inter-Bold.ttf',
            'https://raw.githubusercontent.com/rsms/inter/master/fonts/ttf/Inter-Bold.ttf',
            'https://cdn.jsdelivr.net/gh/rsms/inter@4.0/fonts/ttf/Inter-Bold.ttf'
        ]
        ]
    ]);
    for (const [name, urls] of fontSources.entries()) {
        if ((name.includes('Regular') && interRegular) || (name.includes('Bold') && interBold)) {
            continue;
        }
        for (const url of urls) {
            try {
                const buf = await downloadFont(url);
                if (!buf || !buf.length) {
                    throw new Error('Empty response');
                }
                if (name.includes('Regular')) interRegular = buf; else if (name.includes('Bold')) interBold = buf;
                try {
                    const fontsDir = resolve(process.cwd(), 'public/fonts');
                    ensureDir(fontsDir);
                    writeFileSync(resolve(fontsDir, name), buf);
                    console.log('Downloaded', name, 'from', url, 'for OG generation.');
                } catch (error) {
                    console.warn('Failed to persist downloaded font', name, error instanceof Error ? error.message : error);
                }
                break;
            } catch (error) {
                console.warn('Unable to download font', name, 'from', url, error instanceof Error ? error.message : error);
            }
        }
    }
}
if (!fallbackRegular || !fallbackBold) {
    const notoSources = new Map([
        ['NotoSans-Regular.ttf', 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf'],
        ['NotoSans-Bold.ttf', 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf']
    ]);
    for (const [name, url] of notoSources.entries()) {
        const isRegular = name.includes('Regular');
        const isBold = name.includes('Bold');
        if ((isRegular && fallbackRegular) || (isBold && fallbackBold)) continue;
        try {
            const buf = await downloadFont(url);
            if (!buf || !buf.length) {
                throw new Error('Empty response');
            }
            const fontsDir = resolve(process.cwd(), 'public/fonts');
            ensureDir(fontsDir);
            writeFileSync(resolve(fontsDir, name), buf);
            if (isRegular) fallbackRegular = buf;
            if (isBold) fallbackBold = buf;
            console.log('Downloaded', name, 'for OG generation fallback.');
        } catch (error) {
            console.warn('Unable to download fallback font', name, 'from', url, error instanceof Error ? error.message : error);
        }
    }
}
if ((!interRegular || !interBold) && (fallbackRegular || fallbackBold)) {
    if (!interRegular && fallbackRegular) {
        interRegular = fallbackRegular;
    }
    if (!interBold && fallbackBold) {
        interBold = fallbackBold;
    }
    satoriFontName = 'Noto Sans';
}
if (!interBold && interRegular) {
    interBold = interRegular;
}
if (!interRegular && interBold) {
    interRegular = interBold;
}

const OUT_DIR = resolve(process.cwd(), 'public');

const width = 1200;
const height = 630;

const gradientId = 'g';
function loadAsset(name) { try { return readFileSync(resolve(OUT_DIR, name), 'utf8'); } catch { return ''; } }
const markRaw = (loadAsset('ZENO-05.svg') || loadAsset('favicon.svg'));
const mark = markRaw
    .replace(/<\/?svg[^>]*>/g, '')
    .replace(/<\?xml[^>]*>/g, '')
    .replace(/<!DOCTYPE[^>]*>/g, '')
    .trim();
async function buildSvg(useFallback = false) {
    // Attempt Satori only if we have at least one real font (Inter Regular or Bold) loaded.
    if (satoriAvailable && satori && (interRegular || interBold)) {
    try {
            const brand = persona.brand;
            const tagline = persona.tagline;
            const desc = defaultMeta.description;
            const pillars = (persona.pillars || []).slice(0, 3);
            const fontStack = Array.from(new Set([satoriFontName, 'Inter', 'Noto Sans', 'system-ui', 'sans-serif']))
                .filter(Boolean)
                .map(name => name.includes(' ') ? `'${name}'` : name)
                .join(', ');
            function wrap(text, width = 60) {
                const words = text.split(/\s+/); const lines = []; let cur = '';
                for (const w of words) {
                    if ((cur + ' ' + w).trim().length > width) { lines.push(cur.trim()); cur = w; } else { cur += ' ' + w; }
                }
                if (cur.trim()) lines.push(cur.trim());
                return lines;
            }
            const descLines = wrap(desc, 58).slice(0, 3);
            const svgResult = await satori({
                type: 'div',
                props: {
                    // Keep styles minimal (no gradients) to reduce unsupported features risk.
                    style: { display: 'flex', width: '100%', height: '100%', backgroundColor: '#0b1220', fontFamily: fontStack, position: 'relative', color: '#ffffff', padding: 0, margin: 0 },
                    children: [
                        { type: 'div', props: { style: { position: 'absolute', top: 60, right: 80, opacity: 0.08, fontSize: 300, fontWeight: 800, color: '#0ea5e9', lineHeight: 0.8 }, children: brand[0] } },
                        {
                            type: 'div', props: {
                                style: { display: 'flex', flexDirection: 'column', padding: 70, maxWidth: 950, position: 'relative' }, children: [
                                    {
                                        type: 'div', props: {
                                            style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [
                                                { type: 'h1', props: { style: { margin: 0, fontSize: 108, lineHeight: 1, fontWeight: 800, letterSpacing: '-2px' }, children: brand } },
                                                { type: 'h2', props: { style: { margin: 0, fontSize: 46, fontWeight: 600, color: '#8dd9ff', letterSpacing: '-0.5px' }, children: tagline } }
                                            ]
                                        }
                                    },
                                    { type: 'div', props: { style: { marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }, children: descLines.map(line => ({ type: 'div', props: { style: { fontSize: 30, color: '#d1d5db', lineHeight: 1.25 }, children: line } })) } },
                                    pillars.length ? {
                                        type: 'div', props: {
                                            style: { marginTop: 30, display: 'flex', gap: 12, flexWrap: 'wrap' }, children: pillars.map(p => ({
                                                type: 'div', props: {
                                                    style: { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.07)', padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', fontSize: 20, color: '#e2e8f0', fontWeight: 500 }, children: [
                                                        { type: 'span', props: { style: { fontWeight: 700, color: '#0ea5e9' }, children: p.title } },
                                                        { type: 'span', props: { style: { opacity: 0.65 }, children: p.short } }
                                                    ]
                                                }
                                            }))
                                        }
                                    } : null,
                                    { type: 'div', props: { style: { marginTop: 34, display: 'flex', gap: 16, fontSize: 24, color: '#94a3b8', letterSpacing: 3 }, children: ['PERFORMANCE', 'ACCESSIBILITY', 'PWA'].map(txt => ({ type: 'span', props: { children: txt } })) } }
                                ]
                            }
                        }
                    ]
                }
            }, {
                width, height, fonts: [
                    interRegular ? { name: satoriFontName, data: interRegular, weight: 400, style: 'normal' } : null,
                    interBold ? { name: satoriFontName, data: interBold, weight: 700, style: 'normal' } : null
                ].filter(Boolean)
            });
            return svgResult;
        } catch (e) {
            if (!useFallback && satoriFontName !== 'Noto Sans' && (fallbackRegular || fallbackBold)) {
                console.warn('Satori generation with primary font failed, retrying with fallback', e && (e.message || e));
                satoriFontName = 'Noto Sans';
                if (fallbackRegular) interRegular = fallbackRegular;
                if (fallbackBold) interBold = fallbackBold;
                return buildSvg(true);
            }
            console.warn('satori generation failed, fallback static svg', e && (e.stack || e.message || e));
        }
    } else if (satoriAvailable && satori) {
        console.log('Skipping Satori OG generation: no usable TTF fonts available for Satori.');
    }
    const fallbackFontStack = Array.from(new Set([satoriFontName, 'Inter', 'Noto Sans', 'system-ui', 'sans-serif']))
        .filter(Boolean)
        .map(name => name.includes(' ') ? `'${name}'` : name)
        .join(', ');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n  <defs>\n    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">\n      <stop offset="0%" stop-color="#0ea5e9" />\n      <stop offset="50%" stop-color="#a855f7" />\n      <stop offset="100%" stop-color="#f472b6" />\n    </linearGradient>\n    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">\n      <feGaussianBlur stdDeviation="12" result="blur" />\n      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>\n    </filter>\n  </defs>\n  <rect width="100%" height="100%" fill="#0b1220"/>\n  <g opacity="0.85" transform="translate(885 90) scale(2.1)">${mark}</g>\n  <rect x="40" y="40" width="1120" height="550" rx="48" fill="url(#${gradientId})" fill-opacity="0.08" stroke="rgba(255,255,255,0.08)"/>\n  <text x="100" y="220" font-family="${fallbackFontStack}" font-weight="700" font-size="108" fill="#ffffff" filter="url(#glow)">${persona.brand}</text>\n  <text x="102" y="310" font-family="${fallbackFontStack}" font-size="44" fill="#86e1ff" font-weight="600">${persona.tagline}</text>\n  <text x="104" y="370" font-family="${fallbackFontStack}" font-size="30" fill="#d1d5db" opacity="0.95" style="line-height:1.3;">\n    <tspan x="104" dy="0">${defaultMeta.description}</tspan>\n  </text>\n  <text x="104" y="470" font-family="${fallbackFontStack}" font-size="26" fill="#94a3b8" letter-spacing="3">PERFORMANCE • ACCESSIBILITY • PWA</text>\n</svg>`;
}

let svg = await buildSvg();
// Sanitize leading whitespace/BOM for sharp
svg = svg.replace(/^\uFEFF/, '').trim();
writeFileSync(resolve(OUT_DIR, 'share.svg'), svg, 'utf8');

async function raster() {
    if (!sharpAvailable) {
        const tiny = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
        writeFileSync(resolve(OUT_DIR, 'share.png'), Buffer.from(tiny, 'base64'));
        console.log('sharp not available, wrote tiny placeholder');
        return;
    }
    try {
        const buf = await sharp(Buffer.from(svg)).png({ quality: 88 }).resize(1200, 630).toBuffer();
        writeFileSync(resolve(OUT_DIR, 'share.png'), buf);
        console.log('OG assets written: public/share.svg & share.png');
    } catch (e) {
        console.warn('sharp rasterization failed, fallback tiny png', e);
        const tiny = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
        writeFileSync(resolve(OUT_DIR, 'share.png'), Buffer.from(tiny, 'base64'));
    }
}
await raster();
