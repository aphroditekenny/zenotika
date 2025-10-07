import { test, expect, Page } from '@playwright/test';

// Assumes default build without VITE_ENABLE_MOTION_TOGGLE set.
// Verifies motion toggle not present, then with flag present.

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

async function navigate(page: Page) {
  await page.goto(base);
}

test.describe('MotionToggle visibility', () => {
  test('hidden by default (flag off)', async ({ page }) => {
    await navigate(page);
    await expect(page.locator('text=Motion On')).toHaveCount(0);
    await expect(page.locator('text=Motion Off')).toHaveCount(0);
  });

  test('visible when flag enabled', async ({ page }) => {
    test.skip(!process.env.VITE_ENABLE_MOTION_TOGGLE, 'Requires VITE_ENABLE_MOTION_TOGGLE env');
    await navigate(page);
    await expect(page.locator('text=Motion On')).toHaveCount(1);
  });
});
