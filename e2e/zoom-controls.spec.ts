import { test, expect } from '@playwright/test';
import { waitForEditor, setSvgContent } from './helpers';

test.describe('Zoom Controls', () => {
  test('zoom in/out buttons update the zoom percentage', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100" height="100" fill="red"/></svg>');

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
    await waitForEditor(page);
    await setSvgContent(page, '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100" height="100" fill="blue"/></svg>');

    // Zoom in first
    await page.getByLabel('Zoom in').click();
    await page.getByLabel('Zoom in').click();

    // Reset
    await page.getByLabel('Reset zoom').click();

    // Wait for the zoom percentage text to show 100%
    const zoomDisplay = page.locator('.mantine-Text-root:text("100%")');
    await expect(zoomDisplay).toBeVisible({ timeout: 5000 });
  });

  /** What the preview settled on: the svg's box and any viewBox it synthesized. */
  const previewSize = (page: import('@playwright/test').Page) => page.evaluate(() => {
    const svg = document.querySelector('[data-testid="svg-preview"]')?.shadowRoot?.querySelector('svg');
    return {
      w: Math.round(parseFloat(svg?.getAttribute('width') || '0')),
      h: Math.round(parseFloat(svg?.getAttribute('height') || '0')),
      viewBox: svg?.getAttribute('viewBox') ?? null,
    };
  });

  // width="100%" with no viewBox says nothing about how big the drawing is, so
  // the preview has to look at what was actually drawn. These two SVGs differ
  // only in that, and they have to be sized by different rules.
  test('percentage dimensions: content laid out from percentages fills the pane', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect width="100%" height="100%" fill="#f0e0ff"/><circle cx="50%" cy="50%" r="40" fill="#9b59b6"/></svg>');

    // Nothing reaches outside the viewport, so the pane is the natural size and
    // no viewBox is invented for it.
    const pane = await page.locator('[data-testid="preview-panel"] > div').last().evaluate((el) => ({ w: el.clientWidth, h: el.clientHeight }));
    const size = await previewSize(page);
    expect(size.viewBox).toBeNull();
    expect(size.w).toBe(pane.w);
    expect(size.h).toBe(pane.h);
    await expect(page.locator('.mantine-Text-root:text("100%")')).toBeVisible({ timeout: 5000 });
  });

  test('percentage dimensions: content at absolute coordinates gets a viewBox and fits', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    // Deliberately far larger than any preview pane, the way an exported diagram is.
    await setSvgContent(page, '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect x="0" y="0" width="4000" height="2000" fill="#e0f0ff"/><circle cx="2000" cy="1000" r="500" fill="#4a90d9"/></svg>');

    // Without a viewBox the pane would simply clip this and zoom would have
    // nothing to scale, so the preview synthesizes one around the drawing.
    await expect.poll(async () => (await previewSize(page)).viewBox, { timeout: 5000 }).toBe('0 0 4000 2000');

    // ...which makes it open zoomed out to fit, and 100% mean true 1:1 pixels.
    const zoom = page.locator('[data-testid="preview-panel"]').locator('.mantine-Text-root', { hasText: '%' }).first();
    expect(parseInt((await zoom.textContent())!, 10)).toBeLessThan(100);

    await page.getByLabel('Reset zoom').click();
    await expect.poll(async () => (await previewSize(page)).w, { timeout: 5000 }).toBe(4000);
    expect((await previewSize(page)).h).toBe(2000);
  });
});
