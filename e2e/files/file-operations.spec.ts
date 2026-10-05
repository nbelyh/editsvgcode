import { test, expect } from '@playwright/test';
import { waitForEditor } from '../support/helpers.js';

const TEST_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="50" rx="80" ry="40" fill="green"/></svg>';

test.describe('File Upload & Download', () => {
  test('upload an SVG file and see it in the editor', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);

    // Handed over in memory. A file on disk was shared by every copy of this
    // test running at once — both projects, and every --repeat-each — under one
    // fixed name, so one copy unlinked the bytes another was still uploading.
    // That is what "unreliable in WebKit" turned out to be, and it failed in
    // Chromium too once the timing was right.
    const fileInput = page.locator('input[type="file"][accept="image/svg+xml"]');
    await fileInput.setInputFiles({
      name: 'test-upload.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from(TEST_SVG, 'utf-8'),
    });

    const ellipse = page.locator('[data-testid="svg-preview"] ellipse[fill="green"]');
    await expect(ellipse).toBeVisible({ timeout: 10000 });
  });

  test('download button produces a file', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);

    // Download opens a menu of formats; the .svg is the first choice.
    await page.getByRole('button', { name: 'Download' }).click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('menuitem', { name: 'SVG file' }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.svg$/);
  });
});
