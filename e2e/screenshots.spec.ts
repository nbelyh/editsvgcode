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
    const host = document.querySelector('[data-testid="svg-preview"]');
    const el = host?.shadowRoot?.querySelector('svg') ?? host?.querySelector('svg');
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

  test('06 — background modes', async ({ page }) => {
    await page.goto('/');
    await loadDefaultSvg(page);
    await page.waitForTimeout(300);

    const modes = ['Light checkerboard', 'Dark checkerboard', 'White', 'Black'] as const;
    const tempFiles: string[] = [];

    for (const mode of modes) {
      await page.locator(`button[aria-label="${mode}"]`).click();
      await page.waitForTimeout(200);
      const tmpPath = `${SCREENSHOT_DIR}/_tmp-bg-${mode.replace(/\s+/g, '-').toLowerCase()}.png`;
      await page.screenshot({ path: tmpPath });
      tempFiles.push(tmpPath);
    }

    // Composite 2×2 grid using sharp
    const sharp = (await import('sharp')).default;
    const images = await Promise.all(tempFiles.map(f => sharp(f).toBuffer()));
    const meta = await sharp(images[0]).metadata();
    const w = meta.width!;
    const h = meta.height!;
    const gap = 4;
    const composite = sharp({
      create: { width: w * 2 + gap, height: h * 2 + gap, channels: 4, background: { r: 30, g: 30, b: 30, alpha: 1 } },
    }).composite([
      { input: images[0], left: 0, top: 0 },
      { input: images[1], left: w + gap, top: 0 },
      { input: images[2], left: 0, top: h + gap },
      { input: images[3], left: w + gap, top: h + gap },
    ]);
    await composite.png().toFile(`${SCREENSHOT_DIR}/06-background-modes.png`);

    // Clean up temp files
    const { unlinkSync } = await import('fs');
    for (const f of tempFiles) { try { unlinkSync(f); } catch {} }
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

  test('08 — chat conversation', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('esvg-sidebar-tab', 'ai');
      sessionStorage.setItem('esvg-sidebar-tab', 'ai');
    });
    await page.goto('/');
    await loadDefaultSvg(page);
    await page.waitForTimeout(500);

    // Clear any existing chat history
    const clearBtn = page.locator('.aui-header button').first();
    if (await clearBtn.isEnabled().catch(() => false)) {
      await clearBtn.click();
      await page.waitForTimeout(300);
    }

    // First message
    const input = page.locator('textarea.aui-composer-input');
    await input.fill('make the circles red');
    await page.keyboard.press('Enter');
    await expect(page.locator('.aui-msg-assistant')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.aui-status-indicator')).toBeHidden({ timeout: 30000 });
    await page.waitForTimeout(300);

    // Accept the first change
    const acceptBtn = page.getByRole('button', { name: /accept/i });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
      await page.waitForTimeout(500);
    }

    // Second message
    await input.fill('now make them 1.5x bigger');
    await page.keyboard.press('Enter');
    // Wait for second user message + assistant to finish
    await expect(page.locator('.aui-msg-user').nth(1)).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.aui-status-indicator')).toBeHidden({ timeout: 30000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/08-chat-conversation.png` });
  });

  // --- 4. AI Image Generation ---

  test('11 — image generation + vectorizer', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('esvg-sidebar-tab', 'ai');
      sessionStorage.setItem('esvg-sidebar-tab', 'ai');
    });
    await page.goto('/');
    await loadDefaultSvg(page);
    await page.waitForTimeout(500);

    // Clear chat
    const clearBtn = page.locator('.aui-header button').first();
    if (await clearBtn.isEnabled().catch(() => false)) {
      await clearBtn.click();
      await page.waitForTimeout(300);
    }

    // Ask to generate an image
    const input = page.locator('textarea.aui-composer-input');
    await input.fill('draw a cute kitten');
    await page.keyboard.press('Enter');

    // Confirm image generation
    await expect(page.locator('.aui-image-confirm')).toBeVisible({ timeout: 30000 });
    await page.locator('.aui-image-confirm-btn-primary').click();

    // Wait for vectorizer panel to appear (image generated + vectorized)
    await expect(page.locator('.aui-vectorizer')).toBeVisible({ timeout: 120000 });
    await page.waitForTimeout(1000);

    // Expand "More settings" if available
    const moreBtn = page.locator('.aui-vectorizer-toggle');
    if (await moreBtn.isVisible().catch(() => false)) {
      await moreBtn.click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/11-image-generation.png` });
  });

  // --- 5. Icon Search ---

  test('13 — icon picker', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('esvg-sidebar-tab', 'ai');
      sessionStorage.setItem('esvg-sidebar-tab', 'ai');
    });
    await page.goto('/');
    await loadDefaultSvg(page);
    await page.waitForTimeout(500);

    // Clear chat
    const clearBtn = page.locator('.aui-header button').first();
    if (await clearBtn.isEnabled().catch(() => false)) {
      await clearBtn.click();
      await page.waitForTimeout(300);
    }

    // Ask to add an icon — triggers search_icons tool
    const input = page.locator('textarea.aui-composer-input');
    await input.fill('add a star icon');
    await page.keyboard.press('Enter');

    // Wait for icon picker grid to appear
    await expect(page.locator('.aui-icon-picker-grid')).toBeVisible({ timeout: 30000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/13-icon-picker.png` });
  });

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

  // --- 6. File Management ---

  test('14 — files page', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('esvg-sidebar-tab', 'ai');
      sessionStorage.setItem('esvg-sidebar-tab', 'ai');
    });
    await page.goto('/');
    await loadDefaultSvg(page);
    await page.waitForTimeout(500);

    // Save the default file
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);

    // New document → generate a kitten
    await page.goto('/');
    await waitForEditor(page);
    await page.waitForTimeout(500);

    const input = page.locator('textarea.aui-composer-input');
    await input.fill('draw a cute kitten');
    await page.keyboard.press('Enter');

    // Confirm image generation
    await expect(page.locator('.aui-image-confirm')).toBeVisible({ timeout: 30000 });
    await page.locator('.aui-image-confirm-btn-primary').click();

    // Wait for vectorizer, then accept
    await expect(page.locator('.aui-vectorizer')).toBeVisible({ timeout: 120000 });
    await page.waitForTimeout(1000);
    const acceptBtn = page.locator('.aui-proposal-actions .aui-composer-send').first();
    await acceptBtn.click();
    await page.waitForTimeout(500);

    // Save the kitten file
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);

    // Navigate to files page
    await page.goto('/files');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/14-files-page.png` });
  });
});
