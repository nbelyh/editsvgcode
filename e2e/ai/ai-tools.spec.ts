import { test, expect, type Page } from '@playwright/test';
import { waitForEditor, setSvgContent } from '../support/helpers.js';
import { signInTestUser, useEmulatorSuite, FIRESTORE_DB, EMULATOR_AUTH } from '../support/emulator.js';
import { embeddedToken } from '../../src/lib/embedded-data';

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

/** Boot signed in with the AI panel open and `svg` in the editor. Returns the user's uid.
 *  `pro` gives the account an active Pro subscription before the app reads it. */
async function boot(page: Page, svg = DOC, opts: { pro?: boolean } = {}): Promise<string> {
  await page.goto('/');
  await waitForEditor(page);
  const uid = await signInTestUser(page);
  if (opts.pro) await makePro(uid);
  await page.evaluate(() => localStorage.setItem('esvg-sidebar-tab', 'ai'));
  await page.reload();
  await waitForEditor(page);
  await setSvgContent(page, svg);
  return uid;
}

/** An active Pro subscription on users/{uid}, written the way the payment webhook would. */
async function makePro(uid: string): Promise<void> {
  const res = await fetch(`${FIRESTORE_DB}/documents/users/${uid}`, {
    method: 'PATCH',
    headers: { ...EMULATOR_AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { tier: { stringValue: 'pro' }, subscriptionStatus: { stringValue: 'active' } } }),
  });
  if (!res.ok) throw new Error(`makePro failed: ${res.status} ${await res.text()}`);
}

/** The ai_feedback records a user has written, read past the rules with the emulator's owner
 *  token — the app itself can never read them back. */
async function feedbackFor(uid: string): Promise<Array<Record<string, unknown>>> {
  const res = await fetch(`${FIRESTORE_DB}/documents:runQuery`, {
    method: 'POST',
    headers: { ...EMULATOR_AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'ai_feedback' }],
        where: { fieldFilter: { field: { fieldPath: 'uid' }, op: 'EQUAL', value: { stringValue: uid } } },
      },
    }),
  });
  const rows = (await res.json()) as Array<{ document?: { fields: Record<string, Record<string, unknown>> } }>;
  return rows.filter((row) => row.document).map((row) =>
    Object.fromEntries(Object.entries(row.document!.fields).map(([key, value]) => [key, Object.values(value)[0]])));
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

/**
 * The editor still satisfies `check` for `ms` — nothing running in the background, a
 * debounced save or a late document load, has written something else back over it. Restore
 * was reported to fail only sometimes, which is what a race like that looks like: one
 * assertion straight after the click passes, and the document changes a moment later.
 */
async function expectEditorHolds(page: Page, check: (svg: string) => boolean, ms = 3000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const svg = await editorValue(page);
    expect(check(svg), `the editor changed after the restore:\n${svg}`).toBe(true);
    await page.waitForTimeout(250);
  }
}

test.describe('Embedded images', () => {
  // The model reads an embedded photo as a short token. An edit that copies the token must get the
  // photo back when it is applied — otherwise accepting it would destroy the image.
  const PHOTO = `data:image/png;base64,${'iVBORw0KGgoAAAANSUhEUg'.repeat(200)}`;
  const DOC_WITH_PHOTO = [
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 100">',
    `  <image id="photo" x="0" y="0" width="50" height="50" xlink:href="${PHOTO}"/>`,
    '  <text id="title" x="8" y="80">Customer</text>',
    '</svg>',
  ].join('\n');

  test('rewriting the line that holds a photo keeps the photo', async ({ page }) => {
    await boot(page, DOC_WITH_PHOTO);
    await stubChat(page, [[
      call('replace_lines', {
        edits: [{ start: 2, end: 2, content: `  <image id="photo" x="100" y="0" width="50" height="50" xlink:href="${embeddedToken(PHOTO)}"/>` }],
      }),
      say('Moved the photo.'),
    ]]);
    await send(page, 'move the photo to the right');
    await acceptAll(page);

    const svg = await editorValue(page);
    expect(svg).toContain('x="100"');
    expect(svg).toContain(PHOTO);
    expect(svg).not.toContain('⟦embedded');
  });

  test('an edit naming data the document does not hold changes nothing', async ({ page }) => {
    await boot(page, DOC_WITH_PHOTO);
    await stubChat(page, [[
      call('replace_svg', { svg: DOC_WITH_PHOTO.replace(PHOTO, '⟦embedded image/png 1 MB #deadbeef⟧') }),
      say('Rewrote it.'),
    ]]);
    await send(page, 'tidy it up');
    await expect(page.getByText('Rewrote it.')).toBeVisible({ timeout: 15000 });

    await expect(page.locator('.aui-proposal').getByRole('button', { name: 'Accept' })).toHaveCount(0);
    expect(await editorValue(page)).toBe(DOC_WITH_PHOTO);
  });

  test('a refused rewrite leaves the edits after it to be applied', async ({ page }) => {
    // The refused replace_svg rewrote nothing, so the line numbers after it still hold. The edit
    // after it used to be refused all the same, as if the document had been replaced.
    await boot(page, DOC_WITH_PHOTO);
    await stubChat(page, [[
      call('replace_svg', { svg: DOC_WITH_PHOTO.replace(PHOTO, '⟦embedded image/png 1 MB #deadbeef⟧') }),
      call('replace_lines', { edits: [{ start: 3, end: 3, content: '  <text id="title" x="8" y="80">Kunde</text>' }] }),
      say('Renamed it.'),
    ]]);
    await send(page, 'rename the customer');
    await acceptAll(page);

    const svg = await editorValue(page);
    expect(svg).toContain('>Kunde</text>');
    expect(svg).toContain(PHOTO);
  });
});

test.describe('Clipped lines', () => {
  test('markup copied from a clipped line is not written', async ({ page }) => {
    // Only the start of an enormous line is shown. Written back, the copy would drop the rest.
    await boot(page, DOC);
    const before = await editorValue(page);
    await stubChat(page, [[
      call('replace_lines', { edits: [{ start: 2, end: 2, content: '  <rect id="box" [... 4000 more chars on this line, not shown ...]' }] }),
      say('Rewrote it.'),
    ]]);
    await send(page, 'tidy it up');
    await expect(page.getByText('Rewrote it.')).toBeVisible({ timeout: 15000 });

    await expect(page.locator('.aui-proposal').getByRole('button', { name: 'Accept' })).toHaveCount(0);
    expect(await editorValue(page)).toBe(before);
  });
});

test.describe('Pasted SVG', () => {
  // People paste SVG from another assistant to see it. It opens in the editor with no model call
  // and no credit, and Restore takes it back like any accepted edit.
  const PASTED = '<svg xmlns="http://w3.org" viewBox="0 0 40 40"><circle id="sun" cx="20" cy="20" r="10" fill="gold"/></svg>';

  test('a message that is only a document opens it, without asking the model', async ({ page }) => {
    await boot(page);
    let calls = 0;
    await page.route('**/api/chat', (route) => { calls++; return route.abort(); });
    await send(page, PASTED);

    await expect(page.getByText('Opened your SVG in the editor.')).toBeVisible({ timeout: 15000 });
    await expect.poll(() => editorValue(page)).toBe(PASTED.replace('http://w3.org', 'http://www.w3.org/2000/svg'));
    expect(calls).toBe(0);

    await page.getByRole('button', { name: 'Restore' }).click();
    await expect.poll(() => editorValue(page)).toBe(DOC);
  });

  test('a document with an instruction still goes to the model', async ({ page }) => {
    await boot(page);
    await stubChat(page, [[say('Made it red.')]]);
    await send(page, `make it red ${PASTED}`);
    await expect(page.getByText('Made it red.')).toBeVisible({ timeout: 15000 });
    expect(await editorValue(page)).toBe(DOC);
  });
});

test.describe('One path, several parts', () => {
  // A tracer puts every region of one colour in one path; recolouring part of it means
  // splitting it first, and the split must change nothing but the fills asked for.
  const TREE = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">',
    '  <path d="M0 0 h30 v30 h-30 z M10 10 v10 h10 v-10 z M50 0 h10 v10 h-10 z" style="fill: #1C1817;"/>',
    '</svg>',
  ].join('\n');

  test('splitting a path recolours only the part named', async ({ page }) => {
    await boot(page, TREE);
    await stubChat(page, [
      [call('list_path_parts', { selector: 'path' })],
      [call('split_path', { edits: [{ selector: '/svg[1]/path[1]', fills: [{ part: 2, fill: '#A97C50' }] }], summary: 'Coloured the small square' }), say('I took part 2, the small square on the right, for the leaves.')],
    ]);
    await send(page, 'colour the leaves brown');
    await expect(page.locator('.aui-proposal').getByRole('button', { name: 'Accept' })).toBeVisible({ timeout: 20000 });
    // The recolour worked, so the card must not call it ineffective.
    await expect(page.getByText('Applied, but with no visible effect')).toHaveCount(0);
    await acceptAll(page);

    expect(await editorValue(page)).toBe([
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">',
      '  <path d="M0 0 h30 v30 h-30 z M10 10 v10 h10 v-10 z" style="fill: #1C1817;"/>',
      '  <path d="M50 0 h10 v10 h-10 z" style="fill: #A97C50;"/>',
      '</svg>',
    ].join('\n'));
  });
});

test.describe('Dropped connections', () => {
  test('a dropped request says the drawing is unchanged, and Retry sends it again', async ({ page }) => {
    await boot(page);
    let calls = 0;
    await page.route('**/api/chat', async (route) => {
      calls++;
      if (calls === 1) return route.abort('failed');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ output: [say('Here it is.')], credits: CREDITS }) });
    });
    await send(page, 'hello');

    await expect(page.getByText('The connection dropped before the reply arrived')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByText('Here it is.')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('The connection dropped before the reply arrived')).toHaveCount(0);
    await expect(page.locator('.aui-msg-user')).toHaveCount(1);
    expect(calls).toBe(2);
  });
});

test.describe('Offering to generate a picture', () => {
  // A third of the people offered a generated picture chose "No, use SVG code" — on an SVG code
  // site that sounded like the right answer — and then rejected the hand drawing they got. The
  // offer now says what each choice gives and what it costs.
  const KITTEN = call('generate_image', { prompt: 'a cute kitten', summary: 'A cute kitten sitting on a cushion' });

  /** Serve the offer first, then whatever the model sends once it hears the answer; record every request. */
  async function stubOffer(page: Page, afterAnswer: OutputItem[]) {
    const bodies: Array<{ input?: unknown[] }> = [];
    await page.route('**/api/chat', async (route) => {
      bodies.push(JSON.parse(route.request().postData() ?? '{}'));
      const output = bodies.length === 1 ? [KITTEN] : afterAnswer;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ output, credits: CREDITS }) });
    });
    return bodies;
  }

  test('says a generated picture ends as editable SVG, and prices it', async ({ page }) => {
    await boot(page);
    await stubOffer(page, []);
    await send(page, 'Draw me a cute kitten');

    const offer = page.locator('.aui-image-confirm');
    await expect(offer).toBeVisible({ timeout: 15000 });
    await expect(offer).toContainText('This looks like a picture. Generate it?');
    await expect(offer).toContainText('A cute kitten sitting on a cushion');
    await expect(offer).toContainText('traced into SVG shapes, so you can edit it like any other drawing');
    await expect(offer.getByRole('button', { name: 'Generate picture (10 credits)' })).toBeVisible();
    await expect(offer.getByRole('button', { name: 'Draw it with shapes instead (no extra credits)' })).toBeVisible();
  });

  test('a Pro image model is offered at its own price', async ({ page }) => {
    // The price comes from the image model the user picked, not a number written into the copy.
    await page.addInitScript(() => localStorage.setItem('esvg-image-model', 'gpt-image-1'));
    await boot(page, DOC, { pro: true });
    await stubOffer(page, []);
    await send(page, 'Draw me a cute kitten');

    await expect(page.locator('.aui-image-confirm').getByRole('button', { name: 'Generate picture (50 credits)' }))
      .toBeVisible({ timeout: 15000 });
  });

  test('declining tells the model, and the drawing it sends instead can be accepted', async ({ page }) => {
    await boot(page);
    const bodies = await stubOffer(page, [
      call('replace_svg', { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle id="kitten" cx="20" cy="20" r="12" fill="orange"/></svg>', summary: 'A simple hand-drawn kitten' }),
      say('Drew a simple kitten with shapes.'),
    ]);
    await send(page, 'Draw me a cute kitten');
    await page.locator('.aui-image-confirm').getByRole('button', { name: 'Draw it with shapes instead (no extra credits)' })
      .click({ timeout: 15000 });

    await expect(page.getByText('Drew a simple kitten with shapes.')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.aui-image-confirm')).toHaveCount(0);
    // The second request carries the answer: the model was told the picture was declined.
    expect(bodies).toHaveLength(2);
    expect(JSON.stringify(bodies[1].input)).toContain('User declined AI image generation');
    await acceptAll(page);
    expect(await editorValue(page)).toContain('id="kitten"');
  });
});

test.describe('Composer', () => {
  test('a sample prompt fills the composer and hands it the caret', async ({ page }) => {
    // The click left focus on the sample's own button, so Enter did nothing and typing went
    // nowhere until the composer was clicked as well.
    await boot(page);
    await page.getByRole('button', { name: 'Change color of all boxes to red' }).click();

    const composer = page.locator('textarea.aui-composer-input');
    await expect(composer).toHaveValue('Change color of all boxes to red');
    await expect(composer).toBeFocused();
    // The caret is at the end, so typing adds to the sample rather than landing in front of it.
    await page.keyboard.type(' with blue borders');
    await expect(composer).toHaveValue('Change color of all boxes to red with blue borders');
  });
});

test.describe('Failed turns are kept to improve the assistant', () => {
  // What the privacy policy promises: a free-tier user's failed turn is copied — prompt,
  // drawing, proposal — and a Pro user's only when they share it. The emulator enforces
  // firestore.rules, so a record that appears here also passed them.
  const rename = () => [
    call('set_text', { edits: [{ selector: '#title', text: 'Kunde' }], summary: 'Rename' }),
    say('Renamed it.'),
  ];

  test('a free user’s rejected edit is kept with its prompt, drawing and proposal', async ({ page }) => {
    const uid = await boot(page);
    await stubChat(page, [rename()]);
    await send(page, 'rename Customer to Kunde');
    await page.locator('.aui-proposal').getByRole('button', { name: 'Reject' }).click();

    await expect.poll(async () => (await feedbackFor(uid)).length, { timeout: 15000 }).toBe(1);
    const [record] = await feedbackFor(uid);
    expect(record).toMatchObject({ kind: 'reject', tier: 'free', shared: false, prompt: 'rename Customer to Kunde', response: 'Renamed it.' });
    expect(record.svg).toContain('>Customer<');
    expect(record.proposedSvg).toContain('>Kunde<');
    // Deleted by the TTL policy after the 90 days the privacy policy promises.
    const daysKept = (Date.parse(String(record.expireAt)) - Date.now()) / 86_400_000;
    expect(daysKept).toBeGreaterThan(89);
    expect(daysKept).toBeLessThan(91);
  });

  test('a free user’s error reply is kept with the error', async ({ page }) => {
    const uid = await boot(page);
    await page.route('**/api/chat', (route) => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'The model service failed: overloaded' }),
    }));
    await send(page, 'rename Customer to Kunde');
    await expect(page.getByText('Error: The model service failed: overloaded')).toBeVisible({ timeout: 15000 });

    await expect.poll(async () => (await feedbackFor(uid)).length, { timeout: 15000 }).toBe(1);
    const [record] = await feedbackFor(uid);
    expect(record).toMatchObject({ kind: 'error', prompt: 'rename Customer to Kunde', error: 'The model service failed: overloaded' });
    expect(record.svg).toContain('>Customer<');
  });

  test('a Pro user’s rejected edit is not kept', async ({ page }) => {
    const uid = await boot(page, DOC, { pro: true });
    await stubChat(page, [rename()]);
    await send(page, 'rename Customer to Kunde');
    await page.locator('.aui-proposal').getByRole('button', { name: 'Reject' }).click();
    await expect(page.locator('textarea.aui-composer-input')).toHaveValue('rename Customer to Kunde');

    // Nothing to wait for on success, so give a write every chance to land first.
    await page.waitForTimeout(3000);
    expect(await feedbackFor(uid)).toHaveLength(0);
  });

  test('skipping the share prompt keeps nothing, even on the free tier', async ({ page }) => {
    // The prompt asks "Share chat and drawing?" — Skip has to mean no.
    const uid = await boot(page);
    await stubChat(page, [rename()]);
    await send(page, 'rename Customer to Kunde');
    await acceptAll(page);

    await page.getByRole('button', { name: 'Bad response' }).click();
    await page.getByRole('button', { name: 'Skip' }).click();

    await page.waitForTimeout(3000);
    expect(await feedbackFor(uid)).toHaveLength(0);
  });

  test('one failure is kept once, however the user reacts to it', async ({ page }) => {
    // An edit addressed to nothing is recorded as refused when it arrives; sharing it from the
    // thumbs-down afterwards must not write the drawing and chat a second time.
    const uid = await boot(page);
    await stubChat(page, [[
      call('set_text', { edits: [{ selector: '#nope', text: 'Kunde' }], summary: 'Rename' }),
      say('Tried to rename it.'),
    ]]);
    await send(page, 'rename Customer to Kunde');

    await expect.poll(async () => (await feedbackFor(uid)).length, { timeout: 15000 }).toBe(1);
    expect((await feedbackFor(uid))[0]).toMatchObject({ kind: 'refused' });

    await page.getByRole('button', { name: 'Bad response' }).click();
    await page.getByRole('button', { name: 'Share' }).click();
    await page.waitForTimeout(3000);
    expect(await feedbackFor(uid)).toHaveLength(1);
  });

  test('a Pro user’s turn is kept once they share it from the thumbs-down', async ({ page }) => {
    const uid = await boot(page, DOC, { pro: true });
    await stubChat(page, [rename()]);
    await send(page, 'rename Customer to Kunde');
    await acceptAll(page);

    await page.getByRole('button', { name: 'Bad response' }).click();
    await page.getByRole('button', { name: 'Share' }).click();

    await expect.poll(async () => (await feedbackFor(uid)).length, { timeout: 15000 }).toBe(1);
    const [record] = await feedbackFor(uid);
    expect(record).toMatchObject({ kind: 'thumbs_down', tier: 'pro', shared: true, prompt: 'rename Customer to Kunde' });
  });
});

test.describe('Restore, in the same session', () => {
  // The reload path is covered in cloud-chat.spec.ts. These accept an edit through the real
  // proposal card and restore without reloading, so the undo snapshot is the one taken at
  // accept time rather than one rebuilt from storage.
  const restore = (page: Page) => page.getByRole('button', { name: 'Restore' });

  test('restoring right after an accept puts the document back', async ({ page }) => {
    await boot(page);
    await stubChat(page, [[
      call('set_text', { edits: [{ selector: '#title', text: 'Kunde' }], summary: 'Rename' }),
      say('Renamed it.'),
    ]]);
    await send(page, 'rename Customer to Kunde');
    await acceptAll(page);
    await expect.poll(() => editorValue(page)).toContain('>Kunde<');

    await restore(page).first().click();

    await expect.poll(() => editorValue(page)).toBe(DOC);
    await expect(page.getByText('Renamed it.')).not.toBeVisible();
    // The prompt comes back to the composer, ready to be changed and sent again.
    await expect(page.locator('textarea.aui-composer-input')).toHaveValue('rename Customer to Kunde');
    await expectEditorHolds(page, (svg) => svg === DOC);
  });

  test('restoring a later turn keeps what the earlier one did', async ({ page }) => {
    await boot(page);
    await stubChat(page, [
      [call('set_text', { edits: [{ selector: '#title', text: 'Kunde' }], summary: 'Rename' }), say('First.')],
      [call('set_text', { edits: [{ selector: '#title', text: 'Klient' }], summary: 'Rename again' }), say('Second.')],
    ]);
    await send(page, 'rename to Kunde');
    await acceptAll(page);
    await expect.poll(() => editorValue(page)).toContain('>Kunde<');
    await send(page, 'rename to Klient');
    await acceptAll(page);
    await expect.poll(() => editorValue(page)).toContain('>Klient<');

    // One checkpoint above each prompt: the second undoes only the second turn.
    await expect(restore(page)).toHaveCount(2);
    await restore(page).nth(1).click();
    await expect.poll(() => editorValue(page)).toContain('>Kunde<');
    await expect(page.getByText('Second.')).not.toBeVisible();
    await expectEditorHolds(page, (svg) => svg.includes('>Kunde<') && !svg.includes('Klient'));

    await restore(page).first().click();
    await expect.poll(() => editorValue(page)).toBe(DOC);
    await expectEditorHolds(page, (svg) => svg === DOC);
  });

  test('restoring keeps a hand edit made between two accepts', async ({ page }) => {
    // The snapshot restored is the document as it stood when the edit was accepted — hand
    // edits included — not the result of the previous AI edit.
    await boot(page);
    await stubChat(page, [
      [call('set_text', { edits: [{ selector: '#title', text: 'Kunde' }], summary: 'Rename' }), say('First.')],
      [call('set_text', { edits: [{ selector: '#title', text: 'Klient' }], summary: 'Rename again' }), say('Second.')],
    ]);
    await send(page, 'rename to Kunde');
    await acceptAll(page);
    await expect.poll(() => editorValue(page)).toContain('>Kunde<');

    const handEdited = (await editorValue(page)).replace('CustomerID', 'CustomerNo');
    await setSvgContent(page, handEdited);

    await send(page, 'rename to Klient');
    await acceptAll(page);
    await expect.poll(() => editorValue(page)).toContain('>Klient<');

    await restore(page).nth(1).click();
    await expect.poll(() => editorValue(page)).toBe(handEdited);
    await expectEditorHolds(page, (svg) => svg === handEdited);
  });
});

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
    await expect(page.getByText(/Some changes were not applied/)).toBeVisible();
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
    // The note is folded: the headline is for the reader, and the wording that
    // names the tool is written for the assistant. Open it to read that wording,
    // which is the part that has to stay pointed at the rule and not the
    // attribute — and folding it away is not the same as dropping it.
    await page.getByText(/no visible effect/).click();
    await expect(page.getByText(/set_style_rule/)).toBeVisible();
  });

  test('an edit that worked is not called ineffective for saying how it was applied', async ({ page }) => {
    // Removing every match of a selector notes how many went. That note was shown under
    // "no visible effect", over two labels that had plainly gone from the drawing.
    await boot(page);
    await stubChat(page, [[
      call('remove_element', { edits: [{ selector: '.st2' }], summary: 'Remove the labels' }),
    ]]);
    await send(page);
    await expect(page.getByText('Applied, with notes')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/no visible effect/)).toHaveCount(0);
    await acceptAll(page);
    expect(await editorValue(page)).not.toContain('<text');
  });

  test('an address that matches nothing is reported, and nothing changes', async ({ page }) => {
    await boot(page);
    await stubChat(page, [[
      call('set_text', { edits: [{ selector: '#nosuchthing', text: 'x' }], summary: 'Rename' }),
    ]]);
    await send(page);
    await expect(page.getByText(/Some changes were not applied/)).toBeVisible({ timeout: 15000 });
    await acceptAll(page);
    expect(await editorValue(page)).toBe(DOC);
  });

  test('get_png_image sends its picture after the results, and the next turn does not replay it', async ({ page }) => {
    await boot(page);
    await stubChat(page, [
      [call('get_png_image', { highlight: ['#box'], crop: null, size: null })],
      [say('That is the box.')],
      [say('Still the box.')],
    ]);
    const bodies: Array<{ input: Array<Record<string, any>> }> = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/chat')) bodies.push(JSON.parse(req.postData() ?? '{}'));
    });
    const isPicture = (item: Record<string, any>) =>
      Array.isArray(item.content) && item.content.some((part: { type?: string }) => part.type === 'input_image');

    await send(page, 'which is the box?');
    await expect(page.getByText('That is the box.')).toBeVisible({ timeout: 15000 });

    // The continuation: the tool's text result, then the picture as its own user item.
    const second = bodies[1].input;
    const outputAt = second.findIndex((item) => item.type === 'function_call_output');
    const pictureAt = second.findIndex(isPicture);
    expect(String(second[outputAt].output)).toContain('1 element matches "#box"');
    expect(pictureAt).toBeGreaterThan(outputAt);
    const image = second[pictureAt].content.find((part: { type?: string }) => part.type === 'input_image');
    expect(image.image_url).toMatch(/^data:image\/png;base64,/);

    // The next turn replays the history: the text result is there, the picture is not.
    await send(page, 'and now?');
    await expect(page.getByText('Still the box.')).toBeVisible({ timeout: 15000 });
    const third = bodies[2].input;
    expect(third.some(isPicture)).toBe(false);
    expect(JSON.stringify(third)).toContain('1 element matches');
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
    // An id-anchored address, not a positional path: the long form is what the
    // model kept mis-copying a step out of, so the short one is handed back
    // whenever the element has an id.
    expect(queryResult).toContain('#title "Customer"');
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
