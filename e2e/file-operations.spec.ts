import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('File Upload & Download', () => {
  test('upload an SVG file and see it in the editor', async ({ page }) => {
    await page.goto('/');

    // Wait for editor to be ready
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });

    // Create a temporary SVG file for upload
    const testSvg = '<svg xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="50" rx="80" ry="40" fill="green"/></svg>';
    const tmpPath = path.join(__dirname, 'test-upload.svg');
    fs.writeFileSync(tmpPath, testSvg, 'utf-8');

    try {
      // Trigger file upload via the hidden input
      const fileInput = page.locator('input[type="file"][accept="image/svg+xml"]');
      await fileInput.setInputFiles(tmpPath);

      // Preview should show the ellipse from the uploaded file
      const ellipse = page.locator('ellipse[fill="green"]');
      await expect(ellipse).toBeVisible({ timeout: 10000 });
    } finally {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }
  });

  test('download button produces a file', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });

    // Click the Download button and capture the download event
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download/i }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.svg$/);
  });
});
