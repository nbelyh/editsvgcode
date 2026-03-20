import { test, expect } from '@playwright/test';

test.describe('Editor + Preview', () => {
  test('loads with default SVG and shows preview', async ({ page }) => {
    await page.goto('/');

    // Editor should appear
    const editor = page.locator('.monaco-editor');
    await expect(editor).toBeVisible({ timeout: 15000 });

    // Preview should render an SVG element
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible({ timeout: 10000 });
  });

  test('typing in editor updates the preview', async ({ page }) => {
    await page.goto('/');

    // Wait for Monaco editor to fully load
    const monacoEditor = page.locator('.monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 15000 });

    // Use Monaco API to set editor content directly
    await page.evaluate(() => {
      const editor = (window as any).__test_monaco_editor;
      if (editor) {
        editor.setValue('<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="blue"/></svg>');
      }
    });

    // Preview should now contain a circle (debounce is 300ms)
    const circle = page.locator('circle[fill="blue"]');
    await expect(circle).toBeVisible({ timeout: 10000 });
  });
});
