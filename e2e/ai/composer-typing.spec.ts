import { test, expect } from '@playwright/test';
import { installRenderCounter, waitForStartup } from '../support/render-counter';

/**
 * Typing in the AI composer must re-render the composer and nothing else in the
 * panel.
 *
 * The draft lives in AiChat, so every keystroke re-renders the panel, and for a
 * while that took the whole conversation and the composer's (kept-mounted) model
 * popover with it: 50–90 ms a keystroke at 4x CPU throttling, which is what put
 * mobile INP over 200 ms in the field. ChatThread and ModelPicker are memoized
 * against that; this guards the memo, which a single unstable prop (an inline
 * callback, a fresh object) silently defeats.
 *
 * Asserted on which components render, not on timings: the suite runs against
 * the dev server, where a millisecond budget would be noise. React reports every
 * commit to the DevTools global hook, so a stub installed before the app loads
 * sees exactly which components did work.
 */

// The phone layout: preview over the chat, which is where the slow typing was
// measured. The render scope is the same at any width.
test.use({ viewport: { width: 412, height: 915 } });

// Which components React renders does not depend on the engine.
test.skip(({ browserName }) => browserName !== 'chromium', 'React render scope is browser-agnostic');

test('typing in the composer re-renders neither the thread nor the model picker', async ({ page }) => {
  await installRenderCounter(page);
  // At phone width the cookie banner sits over the composer.
  await page.addInitScript(() => localStorage.setItem('cookie-consent', 'declined'));
  await page.goto('/');

  const composer = page.locator('textarea.aui-composer-input');
  await expect(composer).toBeEnabled({ timeout: 20000 });

  // Let start-up settle first: auth and the chat load legitimately re-render the
  // thread, and none of that is typing. The sign-in hint is no signal for it any
  // more — it paints before auth answers — so wait for the session itself and
  // the renders it sets off. A guest has no credits listener, so nothing else
  // arrives later.
  await waitForStartup(page);
  await expect(page.getByText(/AI edits need a free sign-in/)).toBeVisible();

  await page.evaluate(() => { (window as any).__renders = {}; });

  const text = 'make it blue';
  await composer.click();
  await composer.pressSequentially(text);
  await expect(composer).toHaveValue(text);

  const renders = await page.evaluate(() => (window as any).__renders as Record<string, number>);
  // Proves the counter is wired up: without this a broken hook would pass the
  // assertions below by seeing nothing at all.
  expect(renders.ChatComposer ?? 0).toBeGreaterThanOrEqual(text.length);
  expect(renders.ChatThread ?? 0, 'ChatThread re-rendered while typing').toBe(0);
  expect(renders.ModelPicker ?? 0, 'ModelPicker re-rendered while typing').toBe(0);
  // ModelPicker staying put is not enough on its own: a context that changes per
  // keystroke would re-render the rows inside it without touching it. The model
  // radios are the only Radios on the page, so any Radio render is one of them.
  expect(renders['@mantine/core/Radio'] ?? 0, 'model radios re-rendered while typing').toBe(0);
});
