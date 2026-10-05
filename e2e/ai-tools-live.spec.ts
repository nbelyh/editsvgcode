import { test, expect, type Page } from '@playwright/test';
import { waitForEditor, setSvgContent } from './helpers.js';
import { shortModelName } from '../src/lib/models';
import { readChatStream } from '../src/lib/chat-stream';
import { signInTestUser, useEmulatorSuite } from './emulator.js';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

/** The drawing a first-time visitor sees, which is where the sample prompts are pressed. */
const STARTER_SVG = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../src/assets/default.svg'), 'utf-8');

/**
 * The app's own traced logo: a cat holding a pencil, 21 anonymous paths. Three of them wear
 * the same orange — the insides of both ears and a stripe on the forehead — so a request for
 * the ears cannot be answered from the markup: by colour it is all three, and nothing says
 * which two are ears. Told apart by their transforms, which are unique.
 */
const TRACED_CAT = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../public/editsvgcode-logo.svg'), 'utf-8');
const CAT_EARS = ['translate(318.0625,137.91796875)', 'translate(734.8125,134.5)'];
const CAT_STRIPE = 'translate(475,166)';

/**
 * A club poster around an embedded JPEG: a raccoon detective in a red scarf. The model reads the
 * photo as an ⟦embedded image/jpeg …⟧ token, so what it shows — the scarf, its colour — exists
 * only in the pixels. Nothing in the markup mentions a scarf.
 */
const POSTER = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'fixtures/detective-poster.svg'), 'utf-8');

/**
 * Four pictograms exported with no ids, one anonymous path each, all the same grey. Which one
 * is the heart is a matter of shape alone. Document order is not left-to-right order.
 */
const ICON_HEART = 'M150 85 C150 85 115 62 115 38 C115 26 124 18 135 18 C142 18 147 22 150 28 C153 22 158 18 165 18 C176 18 185 26 185 38 C185 62 150 85 150 85 Z';
const ICONS = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100">',
  '  <path d="M250 15 L290 50 L280 50 L280 85 L260 85 L260 62 L240 62 L240 85 L220 85 L220 50 L210 50 Z" fill="#555555"/>',
  '  <path d="M355 10 L325 55 L348 55 L340 90 L375 42 L352 42 L362 10 Z" fill="#555555"/>',
  `  <path d="${ICON_HEART}" fill="#555555"/>`,
  '  <path d="M50 10 L59.4 37.06 L88.04 37.64 L65.22 54.94 L73.51 82.36 L50 66 L26.49 82.36 L34.78 54.94 L11.96 37.64 L40.6 37.06 Z" fill="#555555"/>',
  '</svg>',
].join('\n');

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

/**
 * Every tool the model asked for, in order, across all rounds of one turn.
 *
 * Read by passing each /api/chat call through the test, not by listening to the page's
 * responses: Chromium keeps no body for a streamed response, so `response.text()` failed with
 * "No data found for resource" on most replies. That failure was swallowed, and the routing
 * assertions saw some of the tool calls or none — "never searched the icon library" held over
 * an empty list. Fetched here, every reply is read whole; the page then receives the same
 * reply, all at once rather than streamed, which changes nothing about which tools are called.
 */
function recordToolCalls(page: Page): string[] {
  const names: string[] = [];
  void page.route('**/api/chat', async (route) => {
    // A turn's rounds can run for minutes; the default 30 s would cut a slow one off.
    const response = await route.fetch({ timeout: 240000 });
    const body = await response.text();
    if (response.ok()) {
      for (const item of (await outputOf(body).catch(() => undefined)) ?? []) {
        if (item.type === 'function_call' && item.name) names.push(item.name);
      }
    }
    await route.fulfill({ response, body });
  });
  return names;
}

/**
 * The output items of one /api/chat reply. The app asks for a stream, and its
 * `response.completed` event carries the body a JSON reply would, so it is read with the
 * app's own tested stream reader. A hand-written parser here once read the stream as JSON,
 * failed silently, and left every routing assertion looking at no tool calls. An API that
 * predates streaming still answers with the JSON itself.
 */
async function outputOf(body: string): Promise<Array<{ type?: string; name?: string }> | undefined> {
  if (body.trimStart().startsWith('{')) return JSON.parse(body).output;
  const reply = await readChatStream<{ output?: Array<{ type?: string; name?: string }> }>(new Response(body).body!);
  return reply.output;
}

/**
 * A one-colour tree icon as a tracer writes it: every region of the colour in ONE path — a
 * forked trunk and seven leaves — with the colour in a style attribute and a transform on it.
 * Recolouring the leaves and not the trunk was impossible before split_path: the model
 * recoloured the whole path, and the user rejected it and asked again.
 */
const TRUNK = 'M46 100 L46 62 C46 56 43 51 37 46 L40 43 C45 47 48 51 50 55 C52 51 55 47 60 43 L63 46 C57 51 54 56 54 62 L54 100 Z';
const LEAVES = [[50, 10], [34, 16], [66, 16], [22, 28], [78, 28], [38, 32], [62, 32]]
  .map(([cx, cy]) => `M${cx - 8} ${cy} a8 5 0 1 0 16 0 a8 5 0 1 0 -16 0 Z`);
const TRACED_TREE = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 115">',
  `  <path d="${[...LEAVES, TRUNK].join(' ')}" transform="translate(10,5)" style="fill: #1C1817;"/>`,
  '</svg>',
].join('\n');

async function boot(page: Page, svg = DOC) {
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
  await setSvgContent(page, svg);
}

type Stopped = 'done' | 'icon-picker' | 'image-confirm';

/**
 * Send a prompt, wait for the turn to stop however many rounds it takes, and say how it
 * stopped: finished, or held open waiting for the user to pick an icon or confirm an image.
 *
 * Waits on the composer's own run state — its button reads Stop while a turn runs and Send
 * once it is over. Status text is not evidence: streaming relabels "Thinking…" as
 * "Calling query… (round 1)" as soon as the model starts a tool call, so waiting for the
 * thinking label to go returned mid-turn, and everything after it asserted on half a turn.
 */
async function ask(page: Page, prompt: string): Promise<Stopped> {
  const composer = page.locator('textarea.aui-composer-input');
  await expect(composer).toBeVisible({ timeout: 20000 });
  await composer.fill(prompt);
  await composer.press('Enter');
  const stop = page.getByRole('button', { name: 'Stop' });
  await expect(stop).toBeVisible({ timeout: 20000 });
  const seen: { state: Stopped | 'running' } = { state: 'running' };
  await expect.poll(async () => {
    // A picker or a confirmation holds the turn open with Stop still showing, so they are
    // looked for first.
    if (await page.locator('.aui-icon-picker:not(.aui-icon-picker-collapsed)').count()) seen.state = 'icon-picker';
    else if (await page.locator('.aui-image-confirm').count()) seen.state = 'image-confirm';
    else if (await stop.count() === 0) seen.state = 'done';
    return seen.state;
  }, { timeout: 180000, intervals: [500] }).not.toBe('running');
  return seen.state as Stopped;
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

  test('scattered decoration is drawn, not fetched from the icon library', async ({ page }) => {
    // "can you draw some random stars here" opened the icon picker: intent #2 listed star
    // as a library icon, and the model's own reasoning quoted it. The library places one
    // icon at a time behind a picker, so it cannot scatter anything — and a star is one
    // <polygon>. Measured on the real prompt before the fix: picker on 4 runs of 6.
    const tools = recordToolCalls(page);
    await boot(page);
    const stopped = await ask(page, 'can you draw some random stars here');
    // An empty list must not pass for "never searched the icon library": it is what a recorder
    // that heard nothing looks like, which is how this used to pass.
    await expect.poll(() => tools.length, { timeout: 10000 }).toBeGreaterThan(0);
    // Logged before the assertions, so the run that fails is the one that says its route.
    console.log('stars →', stopped, tools.join(', '));
    expect(stopped).toBe('done');
    expect(tools).not.toContain('search_icons');
    await acceptAll(page);

    const svg = await editorValue(page);
    expect(svg.length).toBeGreaterThan(DOC.length);   // something was drawn
    expect(svg).toContain('CustomerID');              // and nothing was taken away
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

  test('part of a traced path is recoloured by splitting it, not by painting all of it', async ({ page }) => {
    const tools = recordToolCalls(page);
    await boot(page, TRACED_TREE);
    await ask(page, 'make the leaves green and the trunk brown');
    await acceptAll(page);

    const svg = await editorValue(page);
    console.log('parts →', tools.join(', '));
    expect(tools).toContain('list_path_parts');
    expect(tools).toContain('split_path');
    for (const wrong of ['replace_svg', 'replace_lines', 'generate_image', 'modify_image']) expect(tools).not.toContain(wrong);
    expect(await parses(page, svg)).toBe(true);

    // Each path's data and colour, the colour as the browser reads it — "green" and #3a7d44 alike.
    const paths = await page.evaluate((s) => {
      const doc = new DOMParser().parseFromString(s, 'image/svg+xml');
      const ctx = document.createElement('canvas').getContext('2d')!;
      return Array.from(doc.getElementsByTagName('path')).map((p) => {
        ctx.fillStyle = '#000';
        ctx.fillStyle = /fill:\s*([^;]+)/.exec(p.getAttribute('style') ?? '')?.[1]?.trim() ?? p.getAttribute('fill') ?? '#000';
        return { d: p.getAttribute('d') ?? '', transform: p.getAttribute('transform'), fill: String(ctx.fillStyle) };
      });
    }, svg);
    const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const holding = (shape: string) => paths.filter((p) => p.d.includes(shape));

    // Nothing was lost or drawn twice: every shape of the tree is in exactly one path, and every
    // part is where the tracer put it.
    for (const shape of [...LEAVES, TRUNK]) expect(holding(shape), shape).toHaveLength(1);
    for (const p of paths) expect(p.transform).toBe('translate(10,5)');

    const [tr, tg, tb] = rgb(holding(TRUNK)[0].fill);
    expect(tr > tg && tg >= tb && tr > 60, `trunk is ${holding(TRUNK)[0].fill}`).toBe(true);
    for (const leaf of LEAVES) {
      const fill = holding(leaf)[0].fill;
      const [r, g, b] = rgb(fill);
      expect(g > r && g > b, `a leaf is ${fill}`).toBe(true);
    }
  });

  test('a part of a traced picture is found by looking at it, and only that part changes', async ({ page }) => {
    const tools = recordToolCalls(page);
    await boot(page, TRACED_CAT);
    await ask(page, "make the inside of the cat's ears purple");
    await acceptAll(page);

    const svg = await editorValue(page);
    console.log('ears →', tools.join(', '));
    // It looked before it edited: the first edit comes after a get_png_image.
    const firstEdit = tools.findIndex((t) => ['set_attribute', 'split_path', 'set_style_rule', 'replace_lines', 'replace_svg'].includes(t));
    expect(tools.indexOf('get_png_image')).toBeGreaterThanOrEqual(0);
    expect(tools.indexOf('get_png_image')).toBeLessThan(firstEdit);
    for (const wrong of ['generate_image', 'modify_image']) expect(tools).not.toContain(wrong);
    expect(await parses(page, svg)).toBe(true);

    // Each path's colour as the browser reads it, keyed by its transform.
    const fills = await page.evaluate((s) => {
      const doc = new DOMParser().parseFromString(s, 'image/svg+xml');
      const ctx = document.createElement('canvas').getContext('2d')!;
      return Array.from(doc.getElementsByTagName('path')).map((p) => {
        ctx.fillStyle = '#000';
        ctx.fillStyle = /fill:\s*([^;]+)/.exec(p.getAttribute('style') ?? '')?.[1]?.trim() ?? p.getAttribute('fill') ?? '#000';
        return { transform: p.getAttribute('transform') ?? '', fill: String(ctx.fillStyle) };
      });
    }, svg);
    const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    for (const ear of CAT_EARS) {
      const held = fills.filter((f) => f.transform === ear);
      expect(held.length, ear).toBeGreaterThan(0);
      for (const { fill } of held) {
        const [r, g, b] = rgb(fill);
        expect(r > g && b > g, `an ear is ${fill}`).toBe(true);
      }
    }
    // The stripe shares the ears' orange and was not asked for.
    expect(fills.filter((f) => f.transform === CAT_STRIPE).map((f) => f.fill)).toEqual(['#d8762a']);
  });

  test('a colour that exists only in an embedded photo is read off the picture', async ({ page }) => {
    const tools = recordToolCalls(page);
    await boot(page, POSTER);
    await ask(page, "Make the 'New members welcome' line the same colour as the scarf in the photo.");
    await acceptAll(page);

    const svg = await editorValue(page);
    console.log('scarf colour →', tools.join(', '));
    expect(await parses(page, svg)).toBe(true);
    const fill = await page.evaluate((s) => {
      const doc = new DOMParser().parseFromString(s, 'image/svg+xml');
      const text = Array.from(doc.getElementsByTagName('text')).find((t) => t.textContent?.includes('New members welcome'));
      const ctx = document.createElement('canvas').getContext('2d')!;
      ctx.fillStyle = '#000';
      ctx.fillStyle = /fill:\s*([^;]+)/.exec(text?.getAttribute('style') ?? '')?.[1]?.trim() ?? text?.getAttribute('fill') ?? '#000';
      return String(ctx.fillStyle);
    }, svg);
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(fill.slice(i, i + 2), 16));
    // The scarf is a strong red; nothing in the markup says so.
    expect(r > 140 && g < 100 && b < 100, `the line is ${fill}`).toBe(true);
  });

  test('what a drawing with no text shows is read off the picture', async ({ page }) => {
    const tools = recordToolCalls(page);
    await boot(page, TRACED_CAT);
    await ask(page, 'Add a <title> that tells screen readers what this drawing shows.');
    await acceptAll(page);

    const svg = await editorValue(page);
    console.log('title →', tools.join(', '));
    expect(await parses(page, svg)).toBe(true);
    const title = await page.evaluate((s) => {
      const doc = new DOMParser().parseFromString(s, 'image/svg+xml');
      return doc.getElementsByTagName('title')[0]?.textContent ?? '';
    }, svg);
    console.log('title text →', title);
    // 21 anonymous paths: "cat" is nowhere but in the pixels.
    expect(title).toMatch(/\b(cat|kitten|kitty)\b/i);
  });

  test('one of several anonymous icons is picked out by its shape', async ({ page }) => {
    const tools = recordToolCalls(page);
    await boot(page, ICONS);
    await ask(page, 'Make the heart red.');
    await acceptAll(page);

    const svg = await editorValue(page);
    console.log('heart →', tools.join(', '));
    expect(await parses(page, svg)).toBe(true);
    const fills = await page.evaluate((s) => {
      const doc = new DOMParser().parseFromString(s, 'image/svg+xml');
      const ctx = document.createElement('canvas').getContext('2d')!;
      return Array.from(doc.getElementsByTagName('path')).map((p) => {
        ctx.fillStyle = '#000';
        ctx.fillStyle = /fill:\s*([^;]+)/.exec(p.getAttribute('style') ?? '')?.[1]?.trim() ?? p.getAttribute('fill') ?? '#000';
        return { d: p.getAttribute('d') ?? '', fill: String(ctx.fillStyle) };
      });
    }, svg);
    for (const { d, fill } of fills) {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(fill.slice(i, i + 2), 16));
      if (d === ICON_HEART) expect(r > 150 && g < 100 && b < 100, `the heart is ${fill}`).toBe(true);
      else expect(fill, `${d.slice(0, 20)}… was not asked for`).toBe('#555555');
    }
  });

  test('the starter "Draw me a cute kitten" goes to image generation, not a hand drawing', async ({ page }) => {
    // A routing guard for the first sample prompt, on the starter drawing a first-time visitor
    // presses it over. Stopping at the image confirmation is the right route; nothing is
    // generated, since the test never confirms. (The hand-drawn kittens users rejected did NOT
    // come from bad routing: the model chose generate_image and the user declined the
    // confirmation, after which it draws by hand as it is told to. This test passes at every
    // effort, low included.)
    const tools = recordToolCalls(page);
    await boot(page, STARTER_SVG);
    const stopped = await ask(page, 'Draw me a cute kitten');
    console.log('kitten →', stopped, tools.join(', '));
    expect(stopped).toBe('image-confirm');
    expect(tools).toContain('generate_image');
    expect(tools).not.toContain('replace_svg');
  });

  test('the picture offer says its price, and declining it gets a drawing that can be accepted', async ({ page }) => {
    // A third of these offers were declined, and the hand drawing that followed rejected. The
    // offer now says what each choice gives and costs; this drives the decline end to end.
    const tools = recordToolCalls(page);
    await boot(page, STARTER_SVG);
    expect(await ask(page, 'Draw me a cute kitten')).toBe('image-confirm');

    const offer = page.locator('.aui-image-confirm');
    await expect(offer).toContainText('This looks like a picture. Generate it?');
    await expect(offer.getByRole('button', { name: 'Generate picture (10 credits)' })).toBeVisible();
    await offer.getByRole('button', { name: 'Draw it with shapes instead (no extra credits)' }).click();

    await expect(page.getByRole('button', { name: 'Stop' })).toHaveCount(0, { timeout: 180000 });
    await acceptAll(page);
    const svg = await editorValue(page);
    console.log('declined →', tools.join(', '));
    expect(tools).toContain('generate_image');                 // it offered the picture first
    expect(tools).not.toContain('modify_image');
    expect(svg).not.toBe(STARTER_SVG);                         // and drew something instead
    expect(await parses(page, svg)).toBe(true);
  });

  test('accepting the picture offer generates one, traced into shapes that can be accepted', async ({ page }) => {
    // Costs an image on top of the chat — about 3.5 cents at the default image model.
    test.setTimeout(300000);
    await boot(page, STARTER_SVG);
    expect(await ask(page, 'Draw me a cute kitten')).toBe('image-confirm');
    await page.locator('.aui-image-confirm').getByRole('button', { name: 'Generate picture (10 credits)' }).click();

    await expect(page.getByRole('button', { name: 'Stop' })).toHaveCount(0, { timeout: 240000 });
    await acceptAll(page);
    const svg = await editorValue(page);
    const paths = (svg.match(/<path\b/g) ?? []).length;
    console.log('generated →', paths, 'paths,', svg.length, 'chars');
    expect(paths).toBeGreaterThan(5);                          // a traced picture, not a few shapes
    expect(await parses(page, svg)).toBe(true);
  });

  test('a request in two steps is done in one response, not half of it', async ({ page }) => {
    // "Add DASHBOARD text below the logo" widened the canvas and never added the text: the
    // model planned a second round, and a turn ends with its first edit.
    const tools = recordToolCalls(page);
    await boot(page);
    await ask(page, 'add a label reading "Orders" below the table, and make the drawing taller so it fits');
    await acceptAll(page);

    const svg = await editorValue(page);
    console.log('two steps →', tools.join(', '));
    expect(svg).toMatch(/>\s*Orders\s*</);           // the label the request was for
    expect(svg).toContain('CustomerID');              // and nothing else lost
    expect(await parses(page, svg)).toBe(true);
  });

  test('bringing a shape to the front moves it, and never just deletes it', async ({ page }) => {
    // "Move the purple arrow to the front" removed the arrow and never put it back.
    const OVERLAP = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">',
      '  <rect id="red" x="10" y="10" width="60" height="60" fill="red"/>',
      '  <rect id="blue" x="40" y="40" width="60" height="60" fill="blue"/>',
      '</svg>',
    ].join('\n');
    const tools = recordToolCalls(page);
    await boot(page, OVERLAP);
    await ask(page, 'bring the red square to the front');
    await acceptAll(page);

    const svg = await editorValue(page);
    console.log('to front →', tools.join(', '));
    expect(svg).toMatch(/fill="red"/);                                  // still there
    expect(svg.indexOf('fill="red"')).toBeGreaterThan(svg.indexOf('fill="blue"'));   // painted last
    expect(await parses(page, svg)).toBe(true);
  });

  test('replacing lettering drawn as shapes says the font will not match', async ({ page }) => {
    // "Replace GROUP with B2B" swapped outlined letters for live text in silence, and users
    // rejected a word that suddenly looked different. The card's summary is the one line the
    // model reliably writes, so that is where it has to say so.
    const LETTERS = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">',
      '  <g id="word" fill="#777">',
      '    <path d="M10 10 h20 v6 h-14 v28 h8 v-10 h-4 v-6 h10 v22 h-20 z"/>',
      '    <path d="M40 10 h18 v24 h-6 l8 10 h-8 l-8 -10 v10 h-4 z m4 6 v12 h10 v-12 z"/>',
      '    <path d="M70 10 h20 v34 h-20 z m6 6 v22 h8 v-22 z"/>',
      '    <path d="M100 10 h6 v28 h8 v-28 h6 v34 h-20 z"/>',
      '    <path d="M130 10 h18 v18 h-12 v16 h-6 z m6 6 v6 h6 v-6 z"/>',
      '  </g>',
      '</svg>',
    ].join('\n');
    const tools = recordToolCalls(page);
    await boot(page, LETTERS);
    await ask(page, 'the grey shapes are the word GROUP drawn as paths — replace that word with B2B');
    await expect(page.locator('.aui-proposal').first()).toBeVisible({ timeout: 30000 });
    const summaries = (await page.locator('.aui-proposal-summary').allTextContents()).join(' | ');
    console.log('lettering →', tools.join(', '), '| summary:', summaries);
    // Words the request itself supplies — "path", "shape" — prove nothing, and the old prompt's
    // summaries ("Replaced the path-drawn word GROUP with the text B2B in the same gray color")
    // passed a looser check while admitting nothing. What is asserted is the admission.
    expect(summaries).toMatch(/\bfont\b|not identical|won.t match|will not match|approximat|close but/i);
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
