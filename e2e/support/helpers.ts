import { expect, type Page } from '@playwright/test';

/** Wait for Monaco editor to be visible and its API ready. */
export async function waitForEditor(page: Page) {
  await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });
  await page.waitForFunction(() => !!(window as any).__test_monaco_editor, { timeout: 10000 });
}

/**
 * Set SVG content via the Monaco editor API and wait for the preview to show it.
 *
 * Both halves are one self-healing poll on purpose. The document loads
 * asynchronously and pushes its own text into the editor, so a value set before
 * that lands is silently overwritten — and it can be overwritten again after an
 * earlier check passed. Re-applying whenever the value drifts, and only
 * finishing once the preview actually renders this SVG, removes the race.
 *
 * The old helper waited for the preview to merely *differ* from a snapshot taken
 * before setValue, which any unrelated re-render satisfied; assertions then ran
 * against the sample document. Chromium usually won that race and webkit always
 * lost it, which made the preview specs look browser-specific when they were not.
 *
 * Nor is a single match enough, for the same reason one level down: the load
 * that overwrites the editor is triggered by auth settling, and WebKit restores
 * a persisted session about a second later than Chromium does. Both browsers
 * run the same overwrite; only Chromium reliably runs it before the editor is
 * ready. Holding the match rather than returning on it is what makes the helper
 * mean the same thing in both.
 */
export async function setSvgContent(page: Page, svg: string) {
  await page.waitForFunction((s) => {
    const w = window as any;
    const editor = w.__test_monaco_editor;
    if (!editor) return false;
    if (editor.getValue() !== s) {
      editor.updateOptions({ readOnly: false });
      editor.setValue(s);
      w.__test_svg_held = 0;
      return false;
    }
    // Matching once is not enough. The app loads the document after auth
    // settles and pushes it into the editor, and that lands about a second
    // after the editor is ready — so a value set and checked in between is
    // overwritten by a load that had not run yet. Hold the match across
    // several polls, re-applying if it drifts, and the load has to have
    // happened before this returns.
    w.__test_svg_held = (w.__test_svg_held ?? 0) + 1;
    if (w.__test_svg_held < 6) return false;
    const host = document.querySelector('[data-testid="svg-preview"]');
    const el = host?.shadowRoot?.querySelector('svg') ?? host?.querySelector('svg');
    if (!el) return false;
    const expected = new DOMParser().parseFromString(s, 'image/svg+xml').documentElement;
    // The preview injects its own <defs> (checkerboard, selection styles), so
    // compare only the drawable children.
    const shape = (root: Element) => Array.from(root.children)
      .map((c) => c.tagName.toLowerCase())
      .filter((t) => t !== 'defs')
      .join(',');
    return shape(el) === shape(expected);
    // Poll on an interval rather than the default animation frame: re-applying
    // setValue 60x a second restarts the preview's 300ms debounce every time, so
    // it could never settle and the wait timed out on the slower browser.
  }, svg, { timeout: 20000, polling: 500 });
}
