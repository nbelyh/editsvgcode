import { test, expect, type Page } from '@playwright/test';
import { waitForEditor, setSvgContent } from '../support/helpers';

/**
 * Screenshots of the export panels, for /blog and /features.
 *
 * Taken in the real Chrome, in a window, at 1.5×. The headless browser the other screenshots
 * use draws text thinner and softer than Chrome does on a screen, which a dialog full of small
 * labels shows at once; Chrome in a window draws exactly what a visitor sees. The pages show
 * these pictures at their own size, never stretched, so on a 1.5× screen each pixel lands on
 * one pixel. Needs Chrome installed, and opens a window while it runs.
 */

const SCREENSHOT_DIR = 'public/screenshots';

test.use({ channel: 'chrome', headless: false });

// --- 11. Export, October 2026 ---

/** A small square logo: the picture each export panel is shown turning into something else. */
const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff8a5c"/>
      <stop offset="1" stop-color="#ffd27a"/>
    </linearGradient>
    <clipPath id="tile"><rect width="128" height="128" rx="28"/></clipPath>
  </defs>
  <g clip-path="url(#tile)">
    <rect width="128" height="128" fill="url(#sky)"/>
    <circle cx="64" cy="64" r="24" fill="#fff4d6"/>
    <path d="M-4 104 L36 60 L60 84 L84 58 L132 104 V132 H-4 Z" fill="#3b4a8c"/>
    <path d="M-4 110 Q32 100 64 110 T132 110 V132 H-4 Z" fill="#26346b"/>
  </g>
</svg>`;

test.describe('Export screenshots', () => {
  test.use({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 1.5,
    colorScheme: 'dark',
  });

  test.skip(({ browserName }) => browserName !== 'chromium', 'screenshots: chromium only');

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie-consent', 'declined');
      localStorage.setItem('esvg-teaching-bubble-dismissed', '1');
      localStorage.removeItem('esvg-export-settings');
      localStorage.removeItem('esvg-icon-settings');
      localStorage.removeItem('esvg-copy-kind');
    });
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, LOGO);
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'Download' }).click();
  });

  /**
   * The dialog with a strip of the editor around it, after its previews are drawn. The whole
   * window put a 440 px dialog into a 1400 px picture, which a 540 px card then shrank to 40%:
   * the dialog's text came out about 5 px tall, soft at any resolution. Cropped, it is shown at
   * its real size.
   */
  async function shoot(page: Page, file: string) {
    await page.mouse.move(5, 895);
    await page.waitForTimeout(600);
    const box = (await page.locator('.mantine-Modal-content').boundingBox())!;
    const margin = 24;
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/${file}`,
      clip: { x: box.x - margin, y: box.y - margin, width: box.width + 2 * margin, height: box.height + 2 * margin },
    });
  }

  test('28 — exporting a picture in a box of another shape', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'Image (PNG, WebP)…' }).click();
    const dialog = page.getByRole('dialog', { name: 'Export image' });
    // A social preview card is 1200 × 630: the square logo, whole, in the middle of it.
    await dialog.getByText('Custom', { exact: true }).click();
    await dialog.getByRole('button', { name: 'Keep proportions' }).click();
    await dialog.getByLabel('Width').fill('1200');
    await dialog.getByLabel('Height').fill('630');
    await dialog.getByText('White', { exact: true }).click();
    await expect(dialog.getByTestId('export-size')).toHaveText('1200 × 630 px');
    await expect(dialog.getByTestId('export-preview')).toBeVisible();
    await shoot(page, '28-export-image.png');
  });

  test('29 — favicon and app icons', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'Favicon and app icons…' }).click();
    const dialog = page.getByRole('dialog', { name: 'Favicon and app icons' });
    await expect(dialog.getByTestId('icon-preview-180')).toBeVisible();
    await shoot(page, '29-favicon-icons.png');
  });

  test('30 — copying the drawing as a React component', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'Code (data URI, CSS, React)…' }).click();
    const dialog = page.getByRole('dialog', { name: 'Copy as code' });
    await dialog.getByText('React', { exact: true }).click();
    await expect(dialog.getByTestId('copy-code-preview')).toContainText('export default function');
    await shoot(page, '30-copy-as-code.png');
  });
});
