import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { waitForEditor } from './helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="50" rx="80" ry="40" fill="green"/></svg>';

test.describe('File Upload & Download', () => {
  // Skip upload in WebKit — setInputFiles doesn't reliably fire the change event
  test('upload an SVG file and see it in the editor', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit setInputFiles is unreliable for hidden file inputs');

    await page.goto('/');
    await waitForEditor(page);

    const tmpPath = path.join(__dirname, 'test-upload.svg');
    fs.writeFileSync(tmpPath, TEST_SVG, 'utf-8');
    try {
      const fileInput = page.locator('input[type="file"][accept="image/svg+xml"]');
      await fileInput.setInputFiles(tmpPath);
    } finally {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }

    const ellipse = page.locator('[data-testid="svg-preview"] ellipse[fill="green"]');
    await expect(ellipse).toBeVisible({ timeout: 10000 });
  });

  test('download button produces a file', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);

    // Click the Download button and capture the download event
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download/i }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.svg$/);
  });
});
