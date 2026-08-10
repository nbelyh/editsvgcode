import { test, expect, type Page } from '@playwright/test';
import { waitForEditor, setSvgContent } from './helpers.js';
import { shortModelName } from '../src/lib/models';
import { signInTestUser, useEmulatorSuite } from './emulator.js';

/**
 * The same pipeline, driven by the REAL model.
 *
 * Opt-in — `npm run e2e:live` — and kept
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

/**
 * Which model and how hard it thinks — the two knobs that decide whether the
 * routing rules survive. Set them through the runner, which works in every
 * shell; `VAR=1 cmd` is bash-only and silently wrong in PowerShell. Call it
 * with node when passing flags — npm's config parser eats `--flag value` pairs
 * even after the `--`, leaving the run at the default model:
 *
 *   node scripts/e2e-live.mjs --model gpt-5.4 --effort low
 *   npm run e2e:live                     # defaults, no flags to lose
 *
 * Left unset, the app's own defaults apply, which is what a user gets. The
 * reason to set them is that the prompt is long and its rules compete: a model
 * reasoning less resolves that by salience rather than by working out which
 * rule governs, and low effort is where a routing regression shows up first.
 * Compare a run at `low` against one at `high` before trusting a prompt change.
 */
const MODEL = process.env.LIVE_AI_MODEL;
const EFFORT = process.env.LIVE_AI_EFFORT;

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
  await page.evaluate(({ model, effort }) => {
    localStorage.setItem('esvg-sidebar-tab', 'ai');
    // Written before the reload, since both are read once into state on mount.
    // Effort is stored per model, so it has to be keyed by the model it applies
    // to — writing a bare value here would be read back as {} and silently
    // leave the run at the model's default, which is the one result that would
    // make this whole knob lie.
    if (model) localStorage.setItem('esvg-model', model);
    if (model && effort) localStorage.setItem('esvg-effort-by-model', JSON.stringify({ [model]: effort }));
  }, { model: MODEL, effort: EFFORT });
  await page.reload();
  await waitForEditor(page);
  if (MODEL) {
    // Assert what the app RESOLVED, not what we just wrote. resolveEditModel
    // silently falls back to the default for a name it does not recognise and
    // nothing rewrites localStorage, so reading the key back proves only that
    // setItem works — a typo would sail through and the run would report a
    // clean pass at a setting that never ran.
    //
    // The composer's label is the only rendered evidence, and it shows the
    // SHORT name: shortModelName strips "gpt-", so "gpt-5.4" appears as
    // "5.4 · low · img-1-mini". Anchoring on "<short> ·" is what separates it
    // from the default gpt-5.4-mini, which renders "5.4-mini · …" and would
    // satisfy a substring match for the very model we are trying to detect.
    const shown = shortModelName(MODEL).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const label = page.getByText(new RegExp(`^${shown}\\s·`)).first();
    await expect(label, `the app did not resolve to ${MODEL} — is the name right?`)
      .toBeVisible({ timeout: 15000 });
    // Effort renders in the same label, and only for models that offer it.
    if (EFFORT) await expect(label).toContainText(`· ${EFFORT} ·`);
  }
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
  // One browser is enough, and the reason is the bill rather than any engine:
  // what this file asks is whether the MODEL reaches for the right tool, which
  // is the same question whoever renders the page. Named as everything-but-one
  // rather than as a list of engines to exclude — this skipped only WebKit, so
  // adding Firefox to the matrix silently doubled the spend to re-answer the
  // same question, and an exclusion list will drift that way again.
  test.skip(({ browserName }) => browserName !== 'chromium', 'Model routing is browser-agnostic; one run per turn is enough');
  // A turn is several model round-trips, not a click.
  test.setTimeout(240000);

  test('a rename keeps the coordinates it was not asked to change', async ({ page }) => {
    // The original sin: renaming through replace_lines re-typed the line and
    // dropped x/y. Whatever route the model takes, this must hold.
    const tools = recordToolCalls(page);
    await boot(page);
    // "the table HEADING", not "the Customer table" — the wording is the test.
    // Asked to rename the table, a model that also renames CustomerID to
    // KundeID is following ordinary ER convention, so the old wording made the
    // assertion below a coin toss and it duly failed on a later run. Naming the
    // heading leaves exactly one correct answer. Do not shorten this back.
    await ask(page, 'rename the table heading to Kunde');
    await acceptAll(page);

    const svg = await editorValue(page);
    // Logged BEFORE the assertions: a failure here is about which route the
    // model took, and printing it afterwards means the run that failed is the
    // one run that never says.
    console.log('rename →', tools.join(', '));
    expect(svg).toContain('Kunde');
    expect(svg).toMatch(/<text id="title"[^>]*x="8"[^>]*y="18"/);
    expect(svg).toContain('CustomerID');       // out of scope: only the heading was named
    expect(await parses(page, svg)).toBe(true);
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

  test('a selected element is edited alone, not everything that looks like it', async ({ page }) => {
    // Both <text>s carry class="st2" and x="8", so every address the model
    // might reach for by VALUE — .st2, text[x="8"] — covers both. Only the
    // address supplied with the selection covers one. This is the case the
    // whole scope rule exists for, and the one a model reasoning less is most
    // likely to get wrong, because the value selector is the easier thing to
    // write and looks right in the response.
    const tools = recordToolCalls(page);
    await boot(page);

    // Line 6 is <text id="title">. Putting the cursor there is what the editor
    // turns into a selection, exactly as a user clicking the line would.
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__test_monaco_editor.setPosition({ lineNumber: 6, column: 12 });
    });
    // Wait on the composer's badge, and on its exact contents. A looser matcher
    // here is worse than none: /<text/ finds Monaco's rendered line 6 and passes
    // without the selection having reached the chat panel at all, so the turn
    // below would go out with no selection and the test would be measuring
    // something else entirely while still looking green.
    //
    // "#title" rather than a path because addressForLineRange prefers a short
    // id-anchored address when the element carries a unique id — this is also
    // the exact string the model is about to be handed.
    await expect(page.getByTestId('selection-address')).toHaveText('#title', { timeout: 10000 });

    await ask(page, 'move this label a bit to the right');
    await acceptAll(page);

    const svg = await editorValue(page);
    console.log('scoped edit →', tools.join(', '));
    const xOf = (id: string) => Number(new RegExp(`<text id="${id}"[^>]*\\sx="([\\d.]+)"`).exec(svg)?.[1]);
    expect(xOf('title')).toBeGreaterThan(8);   // the one pointed at moved
    expect(xOf('cols')).toBe(8);               // the one that merely looks like it did not
    expect(svg).toContain('CustomerID');
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
