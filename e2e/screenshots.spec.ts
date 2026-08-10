import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { waitForEditor, setSvgContent } from './helpers';
import { signInTestUser, useEmulatorSuite } from './emulator';

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

// ---------------------------------------------------------------------------
// 7. Structural editing
//
// The only shot in this file whose model is scripted. Every other screenshot
// asks the live assistant and takes whatever comes back, which is fine when the
// picture is of a panel; it is not fine here, where the picture IS the tool
// calls. A live run would spend credits to produce a different transcript each
// time, and the one thing this shot has to show — set_text and set_style_rule
// named on the cards, addressing elements rather than lines — would be down to
// which route the model happened to pick.
//
// Only /api/chat is faked. The addresses are resolved, the edits applied and
// the cards rendered by the real client, so the document in the picture is one
// the app genuinely produced from those calls.
// ---------------------------------------------------------------------------

/**
 * An exported-diagram shape: rules in a <style> block, labels in <text>. The
 * case the structural tools exist for — nothing here is addressable by line.
 *
 * Laid out as a four-stage loop with orthogonal connectors. The first version
 * put three boxes in a zig-zag joined by cubic curves, and they read as wobbly
 * rather than deliberate: an S-bend between two corners has no right angle to
 * line up against, so every curve looked like a near miss. Straight runs on a
 * grid have nothing to get wrong, and every arrow leaves and meets a box edge
 * square-on with the same 4px of clearance.
 */
const DIAGRAM = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">',
  '  <style type="text/css">',
  '    .box  {fill:#94a3b8;stroke:#334155;stroke-width:1.5;}',
  '    .label{font-family:sans-serif;font-size:13px;fill:#0f172a;text-anchor:middle;}',
  '    .flow {stroke:#334155;stroke-width:1.5;fill:none;marker-end:url(#arrow);}',
  '  </style>',
  '  <defs>',
  '    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">',
  '      <path d="M0,0 L10,5 L0,10 z" fill="#334155"/>',
  '    </marker>',
  '  </defs>',
  '  <rect id="draft"     class="box" x="20"  y="20"  width="110" height="48" rx="6"/>',
  '  <rect id="review"    class="box" x="170" y="20"  width="110" height="48" rx="6"/>',
  '  <rect id="published" class="box" x="170" y="132" width="110" height="48" rx="6"/>',
  '  <rect id="archived"  class="box" x="20"  y="132" width="110" height="48" rx="6"/>',
  '  <text class="label" x="75"  y="49">Draft</text>',
  '  <text class="label" x="225" y="49">Review</text>',
  '  <text class="label" x="225" y="161">Published</text>',
  '  <text class="label" x="75"  y="161">Archived</text>',
  '  <path class="flow" d="M134,44 H164"/>',
  '  <path class="flow" d="M225,72 V128"/>',
  '  <path class="flow" d="M166,156 H136"/>',
  '</svg>',
].join('\n');

test.describe('Structural edit screenshot', () => {
  useEmulatorSuite();

  // Shorter than the other shots: this one is a wide strip of three panes with
  // nothing below them, and 900px left a third of the picture empty.
  test.use({
    viewport: { width: 1400, height: 760 },
    colorScheme: 'dark',
  });

  test.skip(({ browserName }) => browserName !== 'chromium', 'screenshots: chromium only');

  test('23 — structural edit tools', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie-consent', 'declined');
      localStorage.setItem('esvg-teaching-bubble-dismissed', '1');
      localStorage.setItem('esvg-sidebar-tab', 'ai');
      sessionStorage.setItem('esvg-sidebar-tab', 'ai');
    });

    // Two rounds, because that is what the loop looks like from outside: the
    // first answer is a read, which the client runs locally and comes back
    // with, and only the second carries edits. Scripting one round would show
    // the assistant editing something it never looked at.
    let round = 0;
    const rounds = [
      [
        { type: 'function_call', name: 'query', call_id: 'q1', arguments: JSON.stringify({ selector: 'text', limit: null }) },
      ],
      [
        {
          type: 'function_call', name: 'set_text', call_id: 't1',
          arguments: JSON.stringify({
            edits: [
              { selector: '/svg[1]/text[1]', text: 'Entwurf' },
              { selector: '/svg[1]/text[2]', text: 'Prüfung' },
              { selector: '/svg[1]/text[3]', text: 'Veröffentlicht' },
              { selector: '/svg[1]/text[4]', text: 'Archiviert' },
            ],
            summary: 'Translate the four labels to German',
          }),
        },
        {
          type: 'function_call', name: 'set_style_rule', call_id: 's1',
          arguments: JSON.stringify({
            edits: [{ selector: '.box', property: 'fill', value: '#60a5fa' }],
            summary: 'Recolour every box through the .box rule',
          }),
        },
        {
          type: 'message',
          content: [{
            type: 'output_text',
            text: 'The four labels are German now, and the boxes are blue. The fill lives in the `.box` rule rather than on the rectangles, so one declaration covers all four.',
          }],
        },
      ],
    ];
    await page.route('**/api/chat', async (route) => {
      const output = rounds[Math.min(round, rounds.length - 1)];
      round += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ output, credits: { remaining: 46, limit: 50, tier: 'free' } }),
      });
    });

    await page.goto('/');
    await waitForEditor(page);
    await signInTestUser(page, 'Sam');
    await page.reload();
    await waitForEditor(page);
    await setSvgContent(page, DIAGRAM);
    await page.waitForTimeout(400);

    const composer = page.locator('textarea.aui-composer-input');
    await expect(composer).toBeVisible({ timeout: 15000 });
    await composer.fill('translate the labels to German and make the boxes blue');
    await composer.press('Enter');

    // Both proposals rendered and the turn finished — otherwise the shot can
    // catch the spinner instead of the cards.
    await expect(page.locator('.aui-proposal')).toHaveCount(2, { timeout: 30000 });
    await expect(page.locator('.aui-status-indicator')).toBeHidden({ timeout: 30000 });

    // Accept both, so the drawing in the picture is the one the words describe.
    // Left pending, the preview showed the renamed labels on grey boxes while
    // the request and the card above both said blue — a reader would read that
    // as the recolour having failed.
    const accept = page.locator('.aui-proposal').getByRole('button', { name: 'Accept' });
    await expect.poll(async () => {
      if (await accept.count() > 0) await accept.first().click({ timeout: 5000 }).catch(() => {});
      return accept.count();
    }, { timeout: 25000, intervals: [250] }).toBe(0);

    // The drawing is small and the preview pane is not; at 100% it sat in the
    // middle of an empty checkerboard.
    await page.getByRole('button', { name: 'Fit to window' }).click();
    // Park the pointer somewhere inert: left where it clicked, the button's
    // tooltip stayed up and covered two of the header links.
    await page.mouse.move(700, 700);
    await expect(page.getByText('Fit to window')).toBeHidden({ timeout: 5000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/23-structural-edits.png` });
  });
});
