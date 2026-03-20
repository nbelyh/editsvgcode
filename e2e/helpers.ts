import { expect, type Page } from '@playwright/test';

/** Wait for Monaco editor to be visible on the page. */
export async function waitForEditor(page: Page) {
  await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });
}

/** Set SVG content via the Monaco editor API and wait for it to appear in the preview. */
export async function setSvgContent(page: Page, svg: string) {
  await page.evaluate((s) => {
    const editor = (window as any).__test_monaco_editor;
    if (editor) editor.setValue(s);
  }, svg);
  await expect(page.locator('[data-testid="svg-preview"] svg')).toBeVisible({ timeout: 10000 });
}
