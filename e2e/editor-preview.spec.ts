import { test, expect } from '@playwright/test';
import { waitForEditor, setSvgContent } from './helpers';

test.describe('Editor + Preview', () => {
  test('renders SVG in preview', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100" height="100" x="50" y="50" fill="red"/></svg>');

    const previewRect = page.locator('[data-testid="svg-preview"] rect');
    await expect(previewRect).toBeVisible({ timeout: 10000 });
  });

  test('typing in editor updates the preview', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="blue"/></svg>');

    const circle = page.locator('circle[fill="blue"]');
    await expect(circle).toBeVisible({ timeout: 10000 });
  });
});
