import { test, expect } from '@playwright/test';

test.describe('DOMPurify Sanitization', () => {
  test('script tags are stripped from SVG preview', async ({ page }) => {
    await page.goto('/');

    // Wait for Monaco editor to load
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });

    // Set malicious SVG via Monaco API
    await page.evaluate(() => {
      const editor = (window as any).__test_monaco_editor;
      if (editor) {
        editor.setValue('<svg xmlns="http://www.w3.org/2000/svg"><script>window.__xss=true<\/script><rect width="100" height="100" fill="red"/></svg>');
      }
    });

    // Wait for preview to update (debounce 300ms)
    await page.waitForTimeout(500);

    // The rect should render
    const rect = page.locator('rect[fill="red"]');
    await expect(rect).toBeVisible({ timeout: 5000 });

    // But the script should NOT have executed
    const xssResult = await page.evaluate(() => (window as any).__xss);
    expect(xssResult).toBeUndefined();

    // And no <script> tag should exist in the preview container
    const scriptCount = await page.locator('svg script').count();
    expect(scriptCount).toBe(0);
  });

  test('onload event handlers are stripped', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });

    // Set SVG with onload handler
    await page.evaluate(() => {
      const editor = (window as any).__test_monaco_editor;
      if (editor) {
        editor.setValue('<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="blue" onload="window.__xss2=true"/></svg>');
      }
    });

    await page.waitForTimeout(500);

    const rect = page.locator('rect[fill="blue"]');
    await expect(rect).toBeVisible({ timeout: 5000 });

    const xssResult = await page.evaluate(() => (window as any).__xss2);
    expect(xssResult).toBeUndefined();
  });
});
