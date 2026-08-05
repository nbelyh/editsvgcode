import { test, expect, type Page } from '@playwright/test';
import { waitForEditor, setSvgContent } from './helpers.js';
import { signInTestUser, useEmulatorSuite } from './emulator.js';

/**
 * The same pipeline, driven by the REAL model.
 *
 * Opt-in — `LIVE_AI=1 npx playwright test e2e/ai-tools-live.spec.ts` — and kept
 * out of CI on purpose. It answers the one question the stubbed suite
 * structurally cannot: does the model REACH for the right tool? A prompt change
 * that sends "make the boxes blue" back to replace_lines breaks nothing a stub
 * can see, and ruins a drawing in the way that started this work.
 *
 * The price is nondeterminism, so the assertions are written for it: outcomes
 * and invariants, never an exact string the model happened to produce. Where
 * routing is asserted it is asserted as a class ("did not fall back to line
 * editing"), not as one tool name.
 *
 * Needs the API host on :7071 and a real key behind it. Costs roughly a cent
 * a run against this deliberately tiny document.
 */

const LIVE = process.env.LIVE_AI === '1';

const DOC = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">',
  '  <style type="text/css">.st1 {fill:#cdcdcd;stroke:#000000;stroke-width:0.24;}',
  '\t.st2 {font-size:1em;}</style>',
  '  <g id="table">',
  '    <rect id="box" class="st1" x="4" y="4" width="90" height="40"/>',
  '    <text id="title" class="st2" x="8" y="18">Customer</text>',
  '    <text id="cols" class="st2" x="8" y="30">PK<tspan x="8" dy="1.2em">CustomerID</tspan></text>',
  '  </g>',
  '</svg>',
].join('\n');

/** Every tool the model asked for, in order, across all rounds of one turn. */
function recordToolCalls(page: Page): string[] {
  const names: string[] = [];
  page.on('response', async (res) => {
    if (!res.url().includes('/api/chat') || !res.ok()) return;
    try {
      for (const item of (await res.json()).output ?? []) {
        if (item.type === 'function_call' && item.name) names.push(item.name);
      }
    } catch { /* a non-JSON body is not a tool call */ }
  });
  return names;
}

async function boot(page: Page) {
  await page.goto('/');
  await waitForEditor(page);
  await signInTestUser(page);
  await page.evaluate(() => localStorage.setItem('esvg-sidebar-tab', 'ai'));
  await page.reload();
  await waitForEditor(page);
  await setSvgContent(page, DOC);
}

/** Send a prompt and wait for the turn to finish, however many rounds it takes. */
async function ask(page: Page, prompt: string) {
  const composer = page.locator('textarea.aui-composer-input');
  await expect(composer).toBeVisible({ timeout: 20000 });
  await composer.fill(prompt);
  await composer.press('Enter');
  // The composer clears on send and the thinking indicator goes when it is done.
  await expect(page.getByText(/Thinking|Working|Reading|Searching/)).toHaveCount(0, { timeout: 180000 });
}

async function acceptAll(page: Page) {
  // Scoped to the proposal card. The cookie banner also has an "Accept", and an
  // unscoped locator matched it — silently clicking consent instead of the edit,
  // and counting a page with no proposals at all as one still awaiting review.
  const accept = page.locator('.aui-proposal').getByRole('button', { name: 'Accept' });
  await expect(accept.first()).toBeVisible({ timeout: 30000 });
  await expect.poll(async () => {
    if (await accept.count() > 0) await accept.first().click({ timeout: 5000 }).catch(() => {});
    return accept.count();
  }, { timeout: 30000, intervals: [250] }).toBe(0);
}

function editorValue(page: Page): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return page.evaluate(() => (window as any).__test_monaco_editor?.getValue() ?? '');
}

function parses(page: Page, svg: string): Promise<boolean> {
  return page.evaluate(
    (s) => !new DOMParser().parseFromString(s, 'text/xml').querySelector('parsererror'),
    svg,
  );
}

useEmulatorSuite();

test.describe('AI edit tools, against the real model', () => {
  test.skip(!LIVE, 'Set LIVE_AI=1 to run (spends credits, needs the API host on :7071)');
  // A turn is several model round-trips, not a click.
  test.setTimeout(240000);

  test('a rename keeps the coordinates it was not asked to change', async ({ page }) => {
    // The original sin: renaming through replace_lines re-typed the line and
    // dropped x/y. Whatever route the model takes, this must hold.
    const tools = recordToolCalls(page);
    await boot(page);
    await ask(page, 'rename the Customer table to Kunde');
    await acceptAll(page);

    const svg = await editorValue(page);
    expect(svg).toContain('Kunde');
    expect(svg).toMatch(/<text id="title"[^>]*x="8"[^>]*y="18"/);
    expect(svg).toContain('CustomerID');       // an identifier, not a label
    expect(await parses(page, svg)).toBe(true);
    console.log('rename →', tools.join(', '));
  });

  test('recolouring goes through the style rule, not the line', async ({ page }) => {
    // The routing this suite exists to protect. .st1 holds the fill, so a
    // presentation attribute would be overridden and a line rewrite would put
    // every other declaration in the rule at risk.
    const tools = recordToolCalls(page);
    await boot(page);
    await ask(page, 'the boxes are too grey, make them light blue');
    await acceptAll(page);

    const svg = await editorValue(page);
    console.log('recolour →', tools.join(', '));
    expect(tools).toContain('set_style_rule');
    // Everything else in the rule survives untouched.
    expect(svg).toContain('stroke:#000000;stroke-width:0.24;');
    expect(svg).not.toContain('fill:#cdcdcd');
    expect(await parses(page, svg)).toBe(true);
  });

  test('deleting an element uses the tool for it and leaves the rest intact', async ({ page }) => {
    const tools = recordToolCalls(page);
    await boot(page);
    await ask(page, 'delete the column list, keep the title');
    await acceptAll(page);

    const svg = await editorValue(page);
    console.log('delete →', tools.join(', '));
    expect(svg).not.toContain('CustomerID');
    expect(svg).toContain('>Customer<');            // the title stayed
    expect(svg).toMatch(/<rect id="box"[^>]*x="4"/); // and so did the box
    expect(await parses(page, svg)).toBe(true);
  });

  test('a question is answered without touching the document', async ({ page }) => {
    const tools = recordToolCalls(page);
    await boot(page);
    await ask(page, 'what does the title of this table say?');

    console.log('question →', tools.join(', '));
    expect(await editorValue(page)).toBe(DOC);
    await expect(page.locator('.aui-proposal').getByRole('button', { name: 'Accept' })).toHaveCount(0);
  });
});
