import { test, expect, type Page } from '@playwright/test';

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

/**
 * Install a minimal React DevTools hook that counts, per component name, the
 * renders in each commit.
 *
 * A function component rendered in a commit when its fiber both is new since
 * the previous commit and carries the PerformedWork flag. Either test alone is
 * wrong: a subtree React skips entirely keeps its old fibers, flags and all, and
 * a fiber cloned only to bail out is new but has its flags reset.
 */
async function installRenderCounter(page: Page) {
  await page.addInitScript(() => {
    const PERFORMED_WORK = 1;
    const w = window as any;
    w.__renders = {} as Record<string, number>;
    w.__lastRenderAt = {} as Record<string, number>;
    let prevSeen = new Set<object>();
    const nameOf = (type: any): string | undefined => {
      if (typeof type === 'function') return type.displayName || type.name;
      // memo / forwardRef wrappers: Mantine names its components on the wrapper
      // ("@mantine/core/Radio") and leaves the inner render function anonymous.
      if (type && typeof type === 'object') return type.displayName || nameOf(type.type ?? type.render);
      return undefined;
    };
    w.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      supportsFiber: true,
      renderers: new Map(),
      inject: () => 1,
      checkDCE: () => {},
      onScheduleFiberRoot: () => {},
      onCommitFiberUnmount: () => {},
      onPostCommitFiberRoot: () => {},
      setStrictMode: () => {},
      onCommitFiberRoot: (_id: number, root: any) => {
        const seen = new Set<object>();
        const stack = [root.current];
        while (stack.length) {
          const fiber = stack.pop();
          if (!fiber) continue;
          seen.add(fiber);
          const name = nameOf(fiber.type);
          if (name && !prevSeen.has(fiber) && (fiber.flags & PERFORMED_WORK)) {
            w.__renders[name] = (w.__renders[name] ?? 0) + 1;
            w.__lastRenderAt[name] = performance.now();
          }
          if (fiber.sibling) stack.push(fiber.sibling);
          if (fiber.child) stack.push(fiber.child);
        }
        prevSeen = seen;
      },
    };
  });
}

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
  // thread, and none of that is typing. The composer only appears once access is
  // resolved; the sign-in hint only once the panel knows this is a guest, which
  // is the last of them. A guest has no credits listener, so nothing else
  // arrives later. The quiet period on top covers anything that slips past.
  await expect(page.getByText(/Sign-in required to send/)).toBeVisible({ timeout: 20000 });
  await page.waitForFunction(() => {
    const last = (window as any).__lastRenderAt.ChatThread ?? 0;
    return performance.now() - last > 1500;
  }, undefined, { timeout: 20000, polling: 250 });

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
