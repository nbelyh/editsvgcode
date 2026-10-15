import { test, expect, type Route } from '@playwright/test';
import { installRenderCounter, waitForReactQuiet, waitForStartup } from '../support/render-counter';

/**
 * Guards for the phone page's Core Web Vitals: Largest Contentful Paint and
 * Interaction to Next Paint, the two Search Console has flagged on mobile.
 *
 * Asserted on causes, not milliseconds: the suite runs against the dev server,
 * where a timing budget would be noise (see composer-typing.spec.ts, which
 * guards INP while typing the same way). Each test pins down the thing that
 * actually moved the field numbers when it regressed.
 */

// The phone layout: preview over the chat, no code editor.
test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

// The LCP API is Chromium's, and which components React renders does not
// depend on the engine.
test.skip(({ browserName }) => browserName !== 'chromium', 'LCP and render scope are measured in Chromium');

test.beforeEach(async ({ page }) => {
  await installRenderCounter(page);
});

/**
 * Nothing that becomes the page's largest paint may wait for sign-in.
 *
 * A first visit has no session, so the app signs in anonymously, and that is a
 * network round-trip finishing well after first paint. The guest note under
 * the sample prompts is the largest text in a phone's empty chat; while it
 * rendered only once the session said "guest", LCP landed with the sign-in —
 * 4.8s against a first paint of 1.9s on a throttled phone. Here the sign-in is
 * held back until the page has painted, then let through: if anything larger
 * paints after it, that thing was waiting for auth.
 */
test('the largest paint does not wait for the anonymous sign-in', async ({ page }) => {
  // No consent notice: outside the EU there is none, which leaves the chat's own
  // text as the largest thing on screen.
  await page.addInitScript(() => localStorage.setItem('cookie-consent', 'declined'));
  await page.addInitScript(() => {
    const w = window as any;
    w.__lcp = [] as { at: number; size: number; el: string }[];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as any[]) {
        w.__lcp.push({ at: Math.round(e.startTime), size: e.size, el: `${e.element?.tagName}.${e.element?.className}` });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });

  let releaseSignIn!: () => void;
  const signInHeld = new Promise<void>((resolve) => { releaseSignIn = resolve; });
  let signInSeen = false;
  await page.route('**/accounts:signUp**', async (route: Route) => {
    signInSeen = true;
    await signInHeld;
    await route.continue();
  });

  await page.goto('/');
  await expect(page.locator('.aui-empty')).toBeVisible({ timeout: 20000 });
  await waitForReactQuiet(page);
  expect(signInSeen, 'the anonymous sign-in was not requested, so nothing was held back').toBe(true);
  expect(await page.evaluate(() => (window as any).__test.firebaseAuth.getAuth().currentUser)).toBeNull();

  const before = await page.evaluate(() => (window as any).__lcp.length as number);
  expect(before, 'no largest-contentful-paint entry before sign-in').toBeGreaterThan(0);

  releaseSignIn();
  await waitForStartup(page);

  const entries = await page.evaluate(() => (window as any).__lcp as { at: number; size: number; el: string }[]);
  expect(entries.slice(before), `painted larger once signed in, after ${JSON.stringify(entries.slice(0, before))}`).toEqual([]);
});

/**
 * The first taps a phone visitor makes must not build UI or redraw the editor.
 *
 * INP counts the slowest tap of a visit, and the slow ones have been taps that
 * did work unrelated to what they changed on screen: the nav drawer and model
 * picker mounting their contents inside the tap that opened them (152 and 232ms
 * at 4x CPU, fixed by keeping both mounted), and a whole-panel re-render per
 * keystroke (composer-typing.spec.ts). Each tap here may render what it changes
 * and the app shell around it, but mounts nothing of note and leaves the editor
 * page, the preview and the conversation alone.
 */
test('first taps mount nothing heavy and leave the editor alone', async ({ page }) => {
  await page.goto('/');
  await waitForStartup(page);

  const tap = async (name: string | RegExp) => {
    await page.evaluate(() => { const w = window as any; w.__mounts = {}; w.__renders = {}; });
    await page.getByRole('button', { name }).tap();
    await waitForReactQuiet(page, 800);
    return page.evaluate(() => {
      const w = window as any;
      const total = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);
      return { mounts: w.__mounts as Record<string, number>, renders: w.__renders as Record<string, number>, mounted: total(w.__mounts) };
    });
  };
  const untouched = ['EditorPage', 'Preview', 'SelectionOverlay', 'EditorToolbar'];
  const expectEditorAlone = (label: string, renders: Record<string, number>) => {
    for (const name of untouched) expect(renders[name] ?? 0, `${label} re-rendered ${name}`).toBe(0);
  };

  // Dev has no Cloudflare in front, so the consent check cannot place the
  // visitor and asks: the notice holds the footer, as it does for EU phones.
  // Accepting swaps it for the footer links — those mount, and nothing else.
  const accept = await tap('Accept');
  expectEditorAlone('Accept', accept.renders);
  expect(accept.mounts.FooterLink ?? 0, 'the counter saw the footer links mount').toBeGreaterThan(0);
  expect(accept.mounts.ChatThread ?? 0).toBe(0);

  // The drawer's contents are kept mounted; opening it adds only the scroll
  // lock (four small components from react-remove-scroll).
  const drawer = await tap('Open navigation');
  expectEditorAlone('Opening the drawer', drawer.renders);
  expect(drawer.renders.ChatThread ?? 0).toBe(0);
  expect(drawer.mounted, `opening the drawer mounted ${JSON.stringify(drawer.mounts)}`).toBeLessThanOrEqual(6);
  await page.keyboard.press('Escape');
  await waitForReactQuiet(page, 800);

  // Kept mounted with display:none: opening it mounts nothing at all.
  const picker = await tap(/Models in use/);
  expectEditorAlone('Opening the model picker', picker.renders);
  expect(picker.renders.ChatThread ?? 0).toBe(0);
  expect(picker.mounts, 'opening the model picker mounted components').toEqual({});
  await page.getByRole('button', { name: /Models in use/ }).tap();
  await waitForReactQuiet(page, 800);

  // Fills the composer; the conversation is not touched.
  const sample = await tap('Draw me a cute kitten');
  expectEditorAlone('A sample prompt', sample.renders);
  expect(sample.renders.ChatThread ?? 0).toBe(0);
  expect(sample.mounts).toEqual({});
});
