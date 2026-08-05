import { test, expect, type Page } from '@playwright/test';
import { waitForEditor, setSvgContent } from './helpers.js';
import { signInTestUser, useEmulatorSuite } from './emulator.js';

/**
 * The edit pipeline, driven end to end with the model replaced by a script.
 *
 * `/api/chat` is stubbed, so each test states exactly which tool calls come back
 * and then asserts the document they produce. That buys the two things a live
 * model cannot give: the same answer every run, and the ability to pin failure
 * modes — a contradiction between two calls, a document that stops parsing, an
 * address that resolves to nothing — which would otherwise only appear by luck.
 *
 * What runs is the real client: planResponseEdits, the structural planners, the
 * conflict rules, the proposal card and the accept path. Only the model is fake.
 */

/** A document shaped like the real exports: rules in a <style> block, labels
 *  carrying coordinates, and a <text> whose label sits before its tspans. */
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

interface OutputItem {
  type: string;
  name?: string;
  call_id?: string;
  arguments?: string;
  content?: Array<{ type: string; text: string }>;
}

const CREDITS = { remaining: 99, limit: 100, tier: 'free' as const };

/** One tool call in a scripted response. */
function call(name: string, args: unknown, id = `c${Math.floor(Math.random() * 1e9)}`): OutputItem {
  return { type: 'function_call', name, call_id: id, arguments: JSON.stringify(args) };
}

/** The assistant's prose, which the UI renders as the reply. */
function say(text: string): OutputItem {
  return { type: 'message', content: [{ type: 'output_text', text }] };
}

/**
 * Serve `rounds` to successive /api/chat calls.
 *
 * More than one round is not padding: a response containing read calls makes the
 * client execute them locally and come back, so scripting two rounds is what
 * exercises the agentic loop rather than just the edit path.
 */
async function stubChat(page: Page, rounds: OutputItem[][]) {
  let next = 0;
  await page.route('**/api/chat', async (route) => {
    const output = rounds[Math.min(next, rounds.length - 1)] ?? [];
    next += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ output, credits: CREDITS }),
    });
  });
}

async function boot(page: Page, svg = DOC) {
  await page.goto('/');
  await waitForEditor(page);
  await signInTestUser(page);
  await page.evaluate(() => localStorage.setItem('esvg-sidebar-tab', 'ai'));
  await page.reload();
  await waitForEditor(page);
  await setSvgContent(page, svg);
}

async function send(page: Page, prompt = 'do the thing') {
  const composer = page.locator('textarea.aui-composer-input');
  await expect(composer).toBeVisible({ timeout: 15000 });
  await composer.fill(prompt);
  await composer.press('Enter');
}

/**
 * Accept every pending proposal.
 *
 * Written as a poll rather than a counted loop because a response's cards do not
 * all render at once: counting first and then expecting one fewer went wrong in
 * both directions — a second card could appear mid-loop (count went UP), and a
 * card re-rendering under React detached the node the click was aimed at.
 * Re-reading every pass, and finishing only when none are left, is immune to
 * both.
 */
async function acceptAll(page: Page) {
  // Scoped to the proposal card. The cookie banner also has an "Accept", and an
  // unscoped locator matched it — silently clicking consent instead of the edit,
  // and counting a page with no proposals at all as one still awaiting review.
  const accept = page.locator('.aui-proposal').getByRole('button', { name: 'Accept' });
  await expect(accept.first()).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => {
    if (await accept.count() > 0) await accept.first().click({ timeout: 5000 }).catch(() => {});
    return accept.count();
  }, { timeout: 25000, intervals: [250] }).toBe(0);
}

/**
 * NOT covered here: a structural tool refusing a document that does not parse.
 *
 * Getting a half-typed document into the app's React state on purpose means
 * defeating machinery built to resist exactly that, and the resulting test spent
 * more effort on the harness than on the behaviour. It is covered instead by
 * `svg-structural-tools.test.ts` — five tools against five malformed documents,
 * asserting the refusal names `replace_lines` and that no ranges escape into the
 * apply pass — which is a stronger check than one browser case would be. That
 * failures reach the UI at all is covered below by the address-matches-nothing
 * test.
 */

function editorValue(page: Page): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return page.evaluate(() => (window as any).__test_monaco_editor?.getValue() ?? '');
}

useEmulatorSuite();

test.describe('AI edit tools, end to end', () => {
  test('set_text changes the label and keeps every coordinate', async ({ page }) => {
    // The failure that motivated the whole structural layer: a rename through
    // replace_lines re-typed the line and dropped x/y, moving the label to the
    // corner of its group. Valid XML, ruined drawing, reported as success.
    await boot(page);
    await stubChat(page, [[
      call('set_text', { edits: [{ selector: '#title', text: 'Kunde' }], summary: 'Rename' }),
      say('Renamed it.'),
    ]]);
    await send(page, 'rename Customer to Kunde');
    await acceptAll(page);

    const svg = await editorValue(page);
    expect(svg).toContain('<text id="title" class="st2" x="8" y="18">Kunde</text>');
    expect(svg).not.toContain('>Customer<');
  });

  test('set_text edits a leading label without disturbing its tspans', async ({ page }) => {
    await boot(page);
    await stubChat(page, [[
      call('set_text', { edits: [{ selector: '#cols', text: 'PK*' }], summary: 'Mark' }),
    ]]);
    await send(page);
    await acceptAll(page);
    expect(await editorValue(page)).toContain('>PK*<tspan x="8" dy="1.2em">CustomerID</tspan>');
  });

  test('set_style_rule changes one declaration and leaves the rule alone', async ({ page }) => {
    await boot(page);
    await stubChat(page, [[
      call('set_style_rule', { edits: [{ selector: '.st1', property: 'fill', value: '#add8e6' }], summary: 'Recolour' }),
    ]]);
    await send(page);
    await acceptAll(page);
    expect(await editorValue(page)).toContain('.st1 {fill:#add8e6;stroke:#000000;stroke-width:0.24;}');
  });

  test('insert_element adds well-formed markup where asked', async ({ page }) => {
    await boot(page);
    await stubChat(page, [[
      call('insert_element', {
        edits: [{ selector: '#box', position: 'after', svg: '<circle id="dot" cx="50" cy="50" r="3"/>' }],
        summary: 'Add a dot',
      }),
    ]]);
    await send(page);
    await acceptAll(page);
    const svg = await editorValue(page);
    expect(svg).toMatch(/<rect id="box"[^>]*\/>\n\s*<circle id="dot"/);
    expect(await parses(page, svg)).toBe(true);
  });

  test('remove_element takes the element and its line', async ({ page }) => {
    await boot(page);
    await stubChat(page, [[
      call('remove_element', { edits: [{ selector: '#cols' }], summary: 'Drop columns' }),
    ]]);
    await send(page);
    await acceptAll(page);
    const svg = await editorValue(page);
    expect(svg).not.toContain('id="cols"');
    expect(svg).not.toContain('CustomerID');
    expect(svg.split('\n').filter((l) => l.trim() === '')).toHaveLength(0);
    expect(await parses(page, svg)).toBe(true);
  });

  test('replace_lines still edits by line number', async ({ page }) => {
    await boot(page);
    await stubChat(page, [[
      call('replace_lines', {
        edits: [{ start: 4, end: 4, content: '  <g id="table" opacity="0.5">' }],
        summary: 'Fade',
      }),
    ]]);
    await send(page);
    await acceptAll(page);
    expect(await editorValue(page)).toContain('<g id="table" opacity="0.5">');
  });

  test('a read call round-trips through the agentic loop before the edit', async ({ page }) => {
    // Two rounds: the client executes `query` locally, sends the result back,
    // and only the second response carries the edit.
    await boot(page);
    await stubChat(page, [
      [call('query', { selector: '#title', limit: 20 })],
      [call('set_text', { edits: [{ selector: '#title', text: 'Kunde' }], summary: 'Rename' })],
    ]);
    await send(page);
    await acceptAll(page);
    expect(await editorValue(page)).toContain('>Kunde<');
    await expect(page.getByText(/tool calls?: .*query/)).toBeVisible();
  });

  test('text, attribute and line edits in ONE response all land', async ({ page }) => {
    // The three addressing modes resolve to spans of one snapshot. Unit tests
    // cover the planner; this is the only thing that drives all three through
    // the client together.
    await boot(page);
    await stubChat(page, [[
      call('set_text', { edits: [{ selector: '#title', text: 'Kunde' }], summary: 'a' }, 'c1'),
      call('set_attribute', { edits: [{ selector: '#box', name: 'stroke', value: 'red' }], summary: 'b' }, 'c2'),
      call('replace_lines', { edits: [{ start: 4, end: 4, content: '  <g id="table" data-x="1">' }], summary: 'c' }, 'c3'),
    ]]);
    await send(page);
    await acceptAll(page);

    const svg = await editorValue(page);
    expect(svg).toContain('>Kunde<');
    expect(svg).toContain('stroke="red"');
    expect(svg).toContain('data-x="1"');
    // Untouched by all three.
    expect(svg).toContain('CustomerID');
    expect(await parses(page, svg)).toBe(true);
  });

  test('two calls contending for the same bytes: the first wins, the second is reported', async ({ page }) => {
    await boot(page);
    await stubChat(page, [[
      // Line 6 IS #title, so rewriting the line and setting its text contradict.
      call('replace_lines', { edits: [{ start: 6, end: 6, content: '    <text id="title" class="st2" x="8" y="18">Lines</text>' }], summary: 'a' }, 'c1'),
      call('set_text', { edits: [{ selector: '#title', text: 'Structural' }], summary: 'b' }, 'c2'),
    ]]);
    await send(page);
    await acceptAll(page);

    const svg = await editorValue(page);
    expect(svg).toContain('>Lines<');
    expect(svg).not.toContain('>Structural<');
    await expect(page.getByText(/Some edits failed/)).toBeVisible();
  });

  test('an edit that breaks the document is flagged as damage, not success', async ({ page }) => {
    await boot(page);
    await stubChat(page, [[
      call('replace_lines', {
        edits: [{ start: 6, end: 6, content: '    <text id="title" class="st2" x="8" y="18">Kunde</text' }],
        summary: 'Rename',
      }),
    ]]);
    await send(page);
    await expect(page.getByText(/This change breaks the SVG/)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/does not parse after it/)).toBeVisible();
  });

  test('an attribute a style rule overrides says so instead of claiming a change', async ({ page }) => {
    await boot(page);
    await stubChat(page, [[
      call('set_attribute', { edits: [{ selector: '.st1', name: 'fill', value: 'red' }], summary: 'Recolour' }),
    ]]);
    await send(page);
    await expect(page.getByText(/no visible effect/)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/set_style_rule/)).toBeVisible();
  });

  test('an address that matches nothing is reported, and nothing changes', async ({ page }) => {
    await boot(page);
    await stubChat(page, [[
      call('set_text', { edits: [{ selector: '#nosuchthing', text: 'x' }], summary: 'Rename' }),
    ]]);
    await send(page);
    await expect(page.getByText(/Some edits failed/)).toBeVisible({ timeout: 15000 });
    await acceptAll(page);
    expect(await editorValue(page)).toBe(DOC);
  });

  test('query points at the text inside a container rather than the container', async ({ page }) => {
    // A group has no text of its own. Answering with only the group's path is a
    // dead end: set_text must refuse it, and the model has nowhere else to go.
    await boot(page);
    await stubChat(page, [
      [call('query', { selector: '#table', limit: 20 })],
      [say('done')],
    ]);
    // Assert on what the client actually sent back to the model, which is the
    // only thing the model ever gets to act on.
    const results: string[] = [];
    page.on('request', (req) => {
      if (!req.url().includes('/api/chat')) return;
      for (const item of JSON.parse(req.postData() ?? '{}').input ?? []) {
        if (item.type === 'function_call_output') results.push(String(item.output));
      }
    });
    await send(page);
    await expect(page.getByText(/tool calls?: .*query/)).toBeVisible({ timeout: 15000 });

    const queryResult = results.find((r) => r.includes('matched "#table"'));
    expect(queryResult).toBeDefined();
    expect(queryResult).toContain('text inside:');
    expect(queryResult).toContain('/svg[1]/g[1]/text[1] "Customer"');
  });

  test('rejecting a proposal leaves the document untouched', async ({ page }) => {
    await boot(page);
    await stubChat(page, [[
      call('set_text', { edits: [{ selector: '#title', text: 'Kunde' }], summary: 'Rename' }),
    ]]);
    await send(page);
    await page.locator('.aui-proposal').getByRole('button', { name: 'Reject' }).click();
    expect(await editorValue(page)).toBe(DOC);
  });
});

/** Does this text parse as XML, in the page's own parser? */
function parses(page: Page, svg: string): Promise<boolean> {
  return page.evaluate(
    (s) => !new DOMParser().parseFromString(s, 'text/xml').querySelector('parsererror'),
    svg,
  );
}
