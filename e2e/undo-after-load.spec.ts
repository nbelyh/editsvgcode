import { test, expect } from '@playwright/test';
import { waitForEditor, setSvgContent } from './helpers.js';

const MARKED_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="undo-marker" width="10" height="10" fill="red"/></svg>';

/**
 * The document is not what the editor holds at first paint. Until it loads,
 * useDocument seeds a stand-in string, and the editor is mounted on it — so the
 * text the reader came for is applied as an edit on top of something else.
 *
 * That made undo destructive rather than useless: one Ctrl+Z on a document that
 * had just loaded, before touching anything, put the stand-in back, and the
 * autosave then wrote it over the saved copy.
 */
test.describe('Undo directly after a document loads', () => {
  test('does not replace the document with the loading stand-in', async ({ page }) => {
    // A first visit seeds the local id, which is what makes the *next* load go
    // through the stand-in rather than starting from the sample document.
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, MARKED_SVG);

    await page.reload();
    await waitForEditor(page);

    // Hold until the load has actually replaced the stand-in, so the undo below
    // lands on the sequence being tested rather than before it.
    await expect
      .poll(() => page.evaluate(() => (window as any).__test_monaco_editor?.getValue() ?? ''), { timeout: 15000 })
      .toContain('undo-marker');

    await page.locator('.monaco-editor').first().click();
    await page.keyboard.press('Control+z');

    // Never the stand-in — that is the defect. Asserted on its own line so a
    // failure names it rather than reporting some unequal pair of documents.
    await expect
      .poll(() => page.evaluate(() => (window as any).__test_monaco_editor?.getValue() ?? ''))
      .not.toContain('Loading please wait');

    const after = await page.evaluate(() => (window as any).__test_monaco_editor?.getValue() ?? '');
    expect(after).toContain('undo-marker');
  });
});
