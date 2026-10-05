import { test, expect, type Page } from '@playwright/test';
import { waitForEditor, setSvgContent } from '../support/helpers.js';

/**
 * A link can carry the drawing: `?svg=<markup>` for something small, `?url=<https://…>` for a
 * file on the web. An assistant that has just written SVG has somewhere to send someone.
 *
 * The case worth testing is the timing. The editor's own load runs when auth settles, about a
 * second later, and it used to put the reader's previous draft on screen over whatever the link
 * opened. So each test here waits after the drawing appears, rather than asserting once.
 */

const LINKED = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle id="from-link" cx="20" cy="20" r="15" fill="teal"/></svg>';
const DRAFT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect id="my-draft" width="20" height="20"/></svg>';

/** The other site allowing a browser to read it, which a real raw-file host does. */
const CORS = { 'access-control-allow-origin': '*' };

const editorValue = (page: Page): Promise<string> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page.evaluate(() => (window as any).__test_monaco_editor?.getValue() ?? '');

/** The editor holds `marker`, and still holds it after the draft load has had its chance. */
async function holds(page: Page, marker: string) {
  await expect.poll(() => editorValue(page), { timeout: 15000 }).toContain(marker);
  await page.waitForTimeout(2500);
  expect(await editorValue(page)).toContain(marker);
}

test.describe('Opening a drawing from the address', () => {
  test('markup in the address opens, and the draft load does not take it back', async ({ page }) => {
    // A draft this browser already had, which is what used to come back over the link.
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, DRAFT);

    await page.goto(`/?svg=${encodeURIComponent(LINKED)}`);
    await waitForEditor(page);
    await holds(page, 'from-link');

    // Taken out of the address, so a reload cannot reopen it over later work.
    expect(new URL(page.url()).search).toBe('');
  });

  test('the opened drawing is the document from then on, and survives a reload', async ({ page }) => {
    // Opening a link is like pressing New: the drawing becomes this browser's current
    // document, so coming back to the editor returns to it rather than to what was open
    // before. By then the parameter is gone, so the reload reads the stored document.
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, DRAFT);

    await page.goto(`/?svg=${encodeURIComponent(LINKED)}`);
    await waitForEditor(page);
    await holds(page, 'from-link');

    await page.goto('/');
    await waitForEditor(page);
    await holds(page, 'from-link');
  });

  test('an https address is fetched and opened', async ({ page }) => {
    await page.route('https://example.com/logo.svg', (route) =>
      route.fulfill({ status: 200, contentType: 'image/svg+xml', headers: CORS, body: LINKED }));

    await page.goto('/?url=https%3A%2F%2Fexample.com%2Flogo.svg');
    await waitForEditor(page);
    await holds(page, 'from-link');
  });

  test('a link that cannot be read says so and leaves the editor alone', async ({ page }) => {
    await page.route('https://example.com/missing.svg', (route) => route.fulfill({ status: 404, headers: CORS, body: 'nope' }));

    await page.goto('/?url=https%3A%2F%2Fexample.com%2Fmissing.svg');
    await waitForEditor(page);
    await expect(page.getByText('Could not open that link')).toBeVisible({ timeout: 15000 });
    expect(await editorValue(page)).not.toContain('from-link');
  });

  test('an address that is not https is refused, and says so', async ({ page }) => {
    await page.goto('/?url=javascript%3Aalert(1)');
    await waitForEditor(page);
    await expect(page.getByText('Only https addresses can be opened')).toBeVisible({ timeout: 15000 });
    expect(await editorValue(page)).not.toContain('from-link');
    // Gone from the address either way, so a reload does not ask again.
    expect(new URL(page.url()).search).toBe('');
  });

  test('New after opening a link gives the starter drawing, not the loading stand-in', async ({ page }) => {
    // The skip-the-draft-load flag used to stay set, so New's own load was skipped too and the
    // stand-in string was left on screen as an editable document — and then autosaved.
    await page.goto(`/?svg=${encodeURIComponent(LINKED)}`);
    await waitForEditor(page);
    await holds(page, 'from-link');

    await page.getByRole('button', { name: 'New' }).click();
    await page.waitForTimeout(2500);
    const after = await editorValue(page);
    expect(after).not.toContain('Loading please wait');
    expect(after).not.toContain('from-link');
    expect(after).toContain('<svg');
  });
});
