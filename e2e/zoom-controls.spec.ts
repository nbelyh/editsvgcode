import { test, expect } from '@playwright/test';

test.describe('Zoom Controls', () => {
  test('zoom in/out buttons update the zoom percentage', async ({ page }) => {
    await page.goto('/');

    // Wait for preview SVG to appear
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 15000 });

    // Read initial zoom text
    const zoomText = page.locator('text=%');
    await expect(zoomText).toBeVisible({ timeout: 5000 });
    const initialZoom = await zoomText.textContent();

    // Click zoom in
    await page.getByLabel('Zoom in').click();
    // Wait for text to change
    await expect(zoomText).not.toHaveText(initialZoom!, { timeout: 5000 });
    const afterZoomIn = await zoomText.textContent();

    // Click zoom out twice to go below
    await page.getByLabel('Zoom out').click();
    await page.getByLabel('Zoom out').click();
    const afterZoomOut = await zoomText.textContent();

    // Values should differ
    expect(afterZoomIn).not.toBe(afterZoomOut);
  });

  test('reset zoom returns to 100%', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 15000 });

    // Zoom in first
    await page.getByLabel('Zoom in').click();
    await page.getByLabel('Zoom in').click();

    // Reset
    await page.getByLabel('Reset zoom').click();

    // Wait for the zoom percentage text to show 100%
    const zoomDisplay = page.locator('.mantine-Text-root:text("100%")');
    await expect(zoomDisplay).toBeVisible({ timeout: 5000 });
  });
});
