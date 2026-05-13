import { expect, type Page } from '@playwright/test';

/** Wait for Monaco editor to be visible and its API ready. */
export async function waitForEditor(page: Page) {
  await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });
  await page.waitForFunction(() => !!(window as any).__test_monaco_editor, { timeout: 10000 });
}

/** Set SVG content via the Monaco editor API and wait for the preview to re-render. */
export async function setSvgContent(page: Page, svg: string) {
  // Capture the current preview SVG so we can detect when it changes
  const oldHtml = await page.evaluate(() => {
    const host = document.querySelector('[data-testid="svg-preview"]');
    const el = host?.shadowRoot?.querySelector('svg') ?? host?.querySelector('svg');
    return el ? el.outerHTML : '';
  });

  await page.evaluate((s) => {
    const editor = (window as any).__test_monaco_editor;
    if (editor) {
      editor.updateOptions({ readOnly: false });
      editor.setValue(s);
    }
  }, svg);

  // Wait for the preview to actually update (accounts for 300ms debounce)
  await page.waitForFunction((prevHtml) => {
    const host = document.querySelector('[data-testid="svg-preview"]');
    const el = host?.shadowRoot?.querySelector('svg') ?? host?.querySelector('svg');
    return el && el.outerHTML !== prevHtml;
  }, oldHtml, { timeout: 10000 });
}
