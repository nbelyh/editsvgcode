import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { waitForEditor, setSvgContent } from './helpers';

const SCREENSHOT_DIR = 'public/screenshots';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DEFAULT_SVG = readFileSync(resolve(__dirname, '../src/assets/default.svg'), 'utf-8');

/** Load editor with the app's default SVG and wait for preview to render. */
async function loadDefaultSvg(page: Page) {
  await waitForEditor(page);
  // The app loads the default SVG on startup, so just wait for the preview to render
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-testid="svg-preview"] svg');
    return el && el.children.length > 0;
  }, { timeout: 10000 });
}

test.describe('Feature screenshots', () => {
  test.use({
    viewport: { width: 1400, height: 900 },
    colorScheme: 'dark',
  });

  // Only run on chromium — all browsers write to the same screenshot paths
  test.skip(({ browserName }) => browserName !== 'chromium', 'screenshots: chromium only');

  // Dismiss cookie banner and teaching bubble for clean screenshots
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie-consent', 'declined');
      localStorage.setItem('esvg-teaching-bubble-dismissed', '1');
    });
  });

  // --- 1. Code Editor ---

  test('01 — full editor view', async ({ page }) => {
    // Show AI sidebar instead of info
    await page.addInitScript(() => {
      localStorage.setItem('esvg-sidebar-tab', 'ai');
      sessionStorage.setItem('esvg-sidebar-tab', 'ai');
    });
    await page.goto('/');
    await loadDefaultSvg(page);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-editor-full.png` });
  });

  test('02 — autocomplete popup', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">\n  <\n</svg>');
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const ed = (window as any).__test_monaco_editor;
      if (ed) {
        ed.updateOptions({ readOnly: false });
        ed.setPosition({ lineNumber: 2, column: 5 });
        ed.focus();
        ed.trigger('test', 'editor.action.triggerSuggest', {});
      }
    });
    await expect(page.locator('.editor-widget.suggest-widget')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-autocomplete.png` });
    await page.keyboard.press('Escape');
  });

  test('02b — hover tooltip', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">\n  <circle cx="100" cy="100" r="80" fill="coral" />\n</svg>');
    await page.waitForTimeout(300);
    // Hover over the word "circle" (line 2, columns 4-9) to trigger the hover provider
    await page.evaluate(() => {
      const ed = (window as any).__test_monaco_editor;
      if (ed) {
        ed.setPosition({ lineNumber: 2, column: 6 });
        ed.focus();
        ed.trigger('test', 'editor.action.showHover', {});
      }
    });
    await expect(page.locator('.monaco-hover-content')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02b-hover-tooltip.png` });
  });

  test('03 — attribute completion', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">\n  <rect  />\n</svg>');
    await page.waitForTimeout(300);
    // Cursor after space inside <rect | /> (column 9 = after the space)
    await page.evaluate(() => {
      const ed = (window as any).__test_monaco_editor;
      if (ed) {
        ed.updateOptions({ readOnly: false });
        ed.setPosition({ lineNumber: 2, column: 9 });
        ed.focus();
        ed.trigger('test', 'editor.action.triggerSuggest', {});
      }
    });
    await expect(page.locator('.editor-widget.suggest-widget')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-attribute-completion.png` });
    await page.keyboard.press('Escape');
  });

  test('03b — attribute value completion', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">\n  <rect cursor="" width="100" height="100" fill="coral" />\n</svg>');
    await page.waitForTimeout(300);
    // Cursor inside cursor="" (between the quotes) to trigger enum value completion
    await page.evaluate(() => {
      const ed = (window as any).__test_monaco_editor;
      if (ed) {
        ed.updateOptions({ readOnly: false });
        ed.setPosition({ lineNumber: 2, column: 17 });
        ed.focus();
        ed.trigger('test', 'editor.action.triggerSuggest', {});
      }
    });
    await expect(page.locator('.editor-widget.suggest-widget')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03b-value-completion.png` });
    await page.keyboard.press('Escape');
  });

  test('04 — color completion', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">\n  <rect fill="rgb(255, 127, 80)" width="100" height="100"/>\n</svg>');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const ed = (window as any).__test_monaco_editor;
      if (ed) {
        ed.updateOptions({ readOnly: false });
      }
    });
    // Wait for the color decoration to appear
    await expect(page.locator('.monaco-editor .colorpicker-color-decoration')).toBeVisible({ timeout: 5000 });
    // Hover over the color decoration to open the color picker
    await page.locator('.monaco-editor .colorpicker-color-decoration').first().hover();
    // Wait for the color picker widget in the hover
    await expect(page.locator('.colorpicker-widget')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-color-completion.png` });
  });

  // --- 2. Live Preview ---

  test('05 — zoom controls', async ({ page }) => {
    await page.goto('/');
    await loadDefaultSvg(page);
    await page.waitForTimeout(300);
    const zoomIn = page.locator('button[aria-label="Zoom in"]');
    if (await zoomIn.isVisible()) {
      await zoomIn.click();
      await zoomIn.click();
      await zoomIn.click();
    }
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-zoom-controls.png` });
  });

  test('07 — click-to-select', async ({ page }) => {
    await page.goto('/');
    await loadDefaultSvg(page);
    await page.waitForTimeout(500);
    // Click on the first orange circle in the preview
    const preview = page.locator('[data-testid="svg-preview"]');
    const circle = preview.locator('circle').first();
    await circle.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/07-click-to-select.png` });
  });

  // --- 3. AI Chat ---

  test('10 — model selector', async ({ page }) => {
    // Pre-set sidebar to AI chat tab
    await page.addInitScript(() => {
      localStorage.setItem('esvg-sidebar-tab', 'ai');
      sessionStorage.setItem('esvg-sidebar-tab', 'ai');
    });
    await page.goto('/');
    await loadDefaultSvg(page);
    await page.waitForTimeout(300);
    // Wait for AI chat to be visible
    await page.locator('.aui-composer-input').waitFor({ state: 'visible', timeout: 5000 });
    // Click the model text to open the popover
    await page.locator('.aui-composer-footer >> text=/mini/i').first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/10-model-selector.png` });
  });
});
