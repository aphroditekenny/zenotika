import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';

const PREVIEW_URL = process.env.PREVIEW_URL || 'http://localhost:3000/';
const OUT_DIR = resolve(process.cwd(), 'reports');
const OUT_FILE = resolve(OUT_DIR, 'a11y-preview-report.json');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log(`➤ Auditing a11y at ${PREVIEW_URL}`);
    await page.goto(PREVIEW_URL, { waitUntil: 'load', timeout: 30000 });

    // Inject axe-core into the page
  const require = createRequire(import.meta.url);
  const axePkgMain = require.resolve('axe-core');
  const axePath = resolve(dirname(axePkgMain), 'axe.min.js');
    await page.addScriptTag({ path: axePath });

    const results = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      return await axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
        resultTypes: ['violations', 'incomplete', 'passes', 'inapplicable'],
      });
    });

    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(
      OUT_FILE,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        url: PREVIEW_URL,
        axe: {
          totals: {
            violations: results.violations?.length || 0,
            incomplete: results.incomplete?.length || 0,
            passes: results.passes?.length || 0,
            inapplicable: results.inapplicable?.length || 0,
          },
          violations: results.violations || [],
        },
      }, null, 2),
      'utf8',
    );

    console.log('➤ A11y summary:', {
      violations: results.violations?.length || 0,
      incomplete: results.incomplete?.length || 0,
      passes: results.passes?.length || 0,
    });
    console.log(`➤ Report written to ${OUT_FILE}`);
  } catch (err) {
    console.error('✖ A11y audit failed:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
