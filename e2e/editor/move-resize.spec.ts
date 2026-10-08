import { test, expect, type Page } from '@playwright/test';
import { waitForEditor, setSvgContent } from '../support/helpers';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const fixture = (name: string) =>
  readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../fixtures', name), 'utf-8');

/** The text the editor currently has selected. */
async function editorSelection(page: Page): Promise<string> {
  return page.evaluate(() => {
    const editor = (window as any).__test_monaco_editor;
    return editor.getModel().getValueInRange(editor.getSelection());
  });
}

async function editorValue(page: Page): Promise<string> {
  return page.evaluate(() => (window as any).__test_monaco_editor.getValue());
}

/** Centre of a preview element, in page coordinates. */
async function centreOf(page: Page, selector: string) {
  const box = await page.locator(`[data-testid="svg-preview"] ${selector}`).boundingBox();
  if (!box) throw new Error(`${selector} is not on screen`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

const GROUPED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g id="house">
    <rect id="wall" x="40" y="80" width="120" height="100" fill="tan"/>
    <rect id="door" x="90" y="130" width="20" height="50" fill="brown"/>
  </g>
  <circle id="sun" cx="170" cy="30" r="20" fill="gold"/>
</svg>`;

/** Press, travel in a few steps, release — the way a hand drags. */
async function drag(page: Page, from: { x: number; y: number }, dx: number, dy: number, opts: { shift?: boolean; release?: boolean } = {}) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  if (opts.shift) await page.keyboard.down('Shift');
  await page.mouse.move(from.x + dx, from.y + dy, { steps: 6 });
  if (opts.release !== false) await page.mouse.up();
  if (opts.shift) await page.keyboard.up('Shift');
}

/** Centre of one of the selection box's handles. */
async function handle(page: Page, name: string) {
  const box = await page.locator(`[data-testid="selection-overlay"] [data-handle="${name}"]`).boundingBox();
  if (!box) throw new Error(`no ${name} handle`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Click until the code pane selects the element with this id. */
async function selectById(page: Page, id: string) {
  // A quarter of the way in rather than the centre, where the wall has the door.
  const box = await page.locator(`[data-testid="svg-preview"] #${id}`).boundingBox();
  if (!box) throw new Error(`#${id} is not on screen`);
  const at = { x: box.x + box.width / 4, y: box.y + box.height / 4 };
  for (let i = 0; i < 4; i++) {
    await page.mouse.click(at.x, at.y);
    // Starts with: a group's selection also contains its children's ids.
    if ((await editorSelection(page)).match(/^<[a-zA-Z:-]+ id="([^"]*)"/)?.[1] === id) return;
  }
  throw new Error(`could not select #${id}`);
}

test.describe('Preview selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, GROUPED);
  });

  test('repeated clicks walk from the group into its parts', async ({ page }) => {
    const door = await centreOf(page, '#door');

    await page.mouse.click(door.x, door.y);
    await expect.poll(() => editorSelection(page)).toMatch(/^<g id="house">[\s\S]*<\/g>$/);

    await page.mouse.click(door.x, door.y);
    await expect.poll(() => editorSelection(page)).toBe('<rect id="door" x="90" y="130" width="20" height="50" fill="brown"/>');

    // Past the innermost element it starts again from the top.
    await page.mouse.click(door.x, door.y);
    await expect.poll(() => editorSelection(page)).toMatch(/^<g id="house">/);
  });

  test('once inside a group, a click on a sibling stays at that level', async ({ page }) => {
    const door = await centreOf(page, '#door');
    await page.mouse.click(door.x, door.y);
    await page.mouse.click(door.x, door.y);
    await expect.poll(() => editorSelection(page)).toContain('id="door"');

    const wall = await centreOf(page, '#wall');
    await page.mouse.click(wall.x - 30, wall.y);
    await expect.poll(() => editorSelection(page)).toContain('id="wall"');
  });

  test('Delete removes exactly the selected element', async ({ page }) => {
    const door = await centreOf(page, '#door');
    await page.mouse.click(door.x, door.y);
    await page.mouse.click(door.x, door.y);
    await expect.poll(() => editorSelection(page)).toContain('id="door"');

    await page.keyboard.press('Delete');
    await expect.poll(() => editorValue(page)).not.toContain('id="door"');
    const code = await editorValue(page);
    expect(code).toContain('id="wall"');
    expect(code).toContain('</g>');
    // The line went with it, not just the tag.
    expect(code).not.toMatch(/\n[ \t]*\n/);
  });
});

test.describe('Moving and resizing in the preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, GROUPED);
  });

  test('dragging an unselected shape moves what a click there would select', async ({ page }) => {
    const wall = await centreOf(page, '#wall');
    await drag(page, { x: wall.x - 30, y: wall.y }, 30, 0);
    // The wall belongs to the house, and the house has no position of its own.
    await expect.poll(() => editorValue(page)).toContain('<g id="house" transform="translate(30 0)">');
    await expect.poll(() => editorSelection(page)).toMatch(/^<g id="house"/);
  });

  test('dragging a rectangle rewrites its x and y, and nothing else', async ({ page }) => {
    await selectById(page, 'door');
    const door = await centreOf(page, '#door');
    await drag(page, door, 10, 20);
    await expect.poll(() => editorValue(page)).toBe(GROUPED.replace('id="door" x="90" y="130"', 'id="door" x="100" y="150"'));
    await expect.poll(() => editorSelection(page)).toContain('id="door" x="100" y="150"');
  });

  test('one undo takes a whole drag back', async ({ page }) => {
    await selectById(page, 'door');
    await drag(page, await centreOf(page, '#door'), 10, 20);
    await expect.poll(() => editorValue(page)).toContain('x="100" y="150"');
    await page.keyboard.press('Control+z');
    await expect.poll(() => editorValue(page)).toBe(GROUPED);
  });

  test('Escape during a drag puts the shape back', async ({ page }) => {
    await selectById(page, 'door');
    await drag(page, await centreOf(page, '#door'), 10, 20, { release: false });
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await expect(page.locator('[data-testid="svg-preview"] #door')).toHaveAttribute('x', '90');
    expect(await editorValue(page)).toBe(GROUPED);
  });

  test('a corner handle resizes a circle and keeps it round', async ({ page }) => {
    await selectById(page, 'sun');
    await drag(page, await handle(page, 'se'), 10, 0);
    await expect.poll(() => editorValue(page)).toContain('<circle id="sun" cx="175" cy="35" r="25"');
  });

  test('a side handle stretches a rectangle one way', async ({ page }) => {
    // The wall, not the door: at 20px wide the door is offered corner handles only.
    await selectById(page, 'wall');
    await drag(page, await handle(page, 'e'), 15, 40);
    await expect.poll(() => editorValue(page)).toContain('<rect id="wall" x="40" y="80" width="135" height="100"');
  });

  test('Shift keeps the aspect ratio from a corner', async ({ page }) => {
    await selectById(page, 'door');
    await drag(page, await handle(page, 'se'), 20, 0, { shift: true });
    await expect.poll(() => editorValue(page)).toContain('<rect id="door" x="90" y="130" width="40" height="100"');
  });

  test('arrow keys nudge the selection by one unit, Shift by ten', async ({ page }) => {
    await selectById(page, 'door');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => editorValue(page)).toContain('id="door" x="91" y="130"');
    await page.keyboard.press('Shift+ArrowDown');
    await expect.poll(() => editorValue(page)).toContain('id="door" x="91" y="140"');
  });

  test('a click without travel still only selects', async ({ page }) => {
    const door = await centreOf(page, '#door');
    await page.mouse.click(door.x, door.y);
    await page.mouse.click(door.x, door.y);
    await expect.poll(() => editorSelection(page)).toContain('id="door"');
    expect(await editorValue(page)).toBe(GROUPED);
  });
});

test.describe('Moving shapes positioned by a transform', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
  });

  test('a traced path moves by its own translate', async ({ page }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <path id="blob" d="M0 0h40v40h-40z" transform="translate(50,50)" style="fill: #1C1817;"/>
  <path d="M0 0h10v10h-10z" transform="translate(150,150)"/>
</svg>`;
    await setSvgContent(page, svg);
    await drag(page, await centreOf(page, '#blob'), 25, -10);
    await expect.poll(() => editorValue(page)).toContain('<path id="blob" d="M0 0h40v40h-40z" transform="translate(75,40)" style="fill: #1C1817;"/>');
  });

  test('a path resizes with a scale folded into its translate', async ({ page }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <path id="blob" d="M0 0h40v40h-40z" transform="translate(50,50)"/>
  <circle cx="180" cy="180" r="5"/>
</svg>`;
    await setSvgContent(page, svg);
    await selectById(page, 'blob');
    await drag(page, await handle(page, 'se'), 40, 40);
    await expect.poll(() => editorValue(page)).toContain('transform="translate(50,50) scale(2)"');
  });

  test('a drag at a higher zoom moves by fewer units', async ({ page }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect id="box" x="10" y="10" width="20" height="20"/>
  <circle cx="90" cy="90" r="5"/>
</svg>`;
    await setSvgContent(page, svg);
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await expect(page.getByText('125%')).toBeVisible();
    await selectById(page, 'box');
    await drag(page, await centreOf(page, '#box'), 25, 0);
    await expect.poll(() => editorValue(page)).toContain('<rect id="box" x="30" y="10"');
  });
});

test.describe('Moving parts of real drawings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
  });

  test('a step of a flowchart moves as one group', async ({ page }) => {
    await setSvgContent(page, fixture('flowchart.svg'));
    const rect = await page.locator('[data-testid="svg-preview"] #step-idea rect').boundingBox();
    await drag(page, { x: rect!.x + 10, y: rect!.y + 10 }, 0, 40);
    await expect.poll(() => editorValue(page)).toMatch(/<g id="step-idea" transform="translate\(0 \d+\)">/);
  });

  test('a traced shape moves by its translate, and only that changes', async ({ page }) => {
    const before = fixture('lighthouse.svg');
    await setSvgContent(page, before);
    // The first point, scanning from the middle, that lands on a traced path.
    const box = await page.locator('[data-testid="svg-preview"] svg').boundingBox();
    const at = await page.evaluate((b) => {
      const root = document.querySelector('[data-testid="svg-preview"]')!.shadowRoot!;
      for (let dy = 0; dy < b.height / 2; dy += 7) {
        for (const y of [b.y + b.height / 2 + dy, b.y + b.height / 2 - dy]) {
          const x = b.x + b.width / 2;
          if (root.elementFromPoint(x, y)?.getAttribute('transform')?.startsWith('translate(')) return { x, y };
        }
      }
      return null;
    }, box!);
    expect(at).not.toBeNull();
    await drag(page, at!, 30, 0);
    await expect.poll(() => editorValue(page)).not.toBe(before);

    const after = await editorValue(page);
    const was = before.split(/\r?\n/);
    const now = after.split(/\r?\n/);
    expect(now.length).toBe(was.length);
    const changed = now.map((line, i) => [was[i], line]).filter(([a, b]) => a !== b);
    expect(changed).toHaveLength(1);
    // Within that line, only the translate.
    const strip = (line: string) => line.replace(/transform="translate\([^)]*\)"/, 'T');
    expect(strip(changed[0][1])).toBe(strip(changed[0][0]));
  });
});

test.describe('Selection edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
  });

  test('a tag inside a comment does not shift which element is selected or deleted', async ({ page }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="200" height="100">
  <!-- <rect id="ghost"/> -->
  <rect id="a" x="10" y="10" width="60" height="60" fill="teal"/>
  <rect id="b" x="120" y="10" width="60" height="60" fill="orange"/>
</svg>`;
    await setSvgContent(page, svg);
    await selectById(page, 'a');
    await page.keyboard.press('Delete');
    await expect.poll(() => editorValue(page)).not.toContain('id="a"');
    expect(await editorValue(page)).toContain('id="b"');
  });

  test('Ctrl+click keeps the shapes already picked', async ({ page }) => {
    await setSvgContent(page, GROUPED);
    const sun = await centreOf(page, '#sun');
    const wall = await centreOf(page, '#wall');
    await page.mouse.click(sun.x, sun.y);
    await page.keyboard.down('Control');
    await page.mouse.click(wall.x - 30, wall.y);
    await page.keyboard.up('Control');
    await page.waitForTimeout(400);
    const picked = await page.evaluate(() =>
      document.querySelector('[data-testid="svg-preview"]')!.shadowRoot!.querySelectorAll('[data-esvg-selected]').length);
    expect(picked).toBe(2);
  });

  test('undo right after a nudge puts the preview back, and editing goes on', async ({ page }) => {
    await setSvgContent(page, GROUPED);
    await selectById(page, 'door');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Control+z');
    await expect(page.locator('[data-testid="svg-preview"] #door')).toHaveAttribute('x', '90');
    expect(await editorValue(page)).toBe(GROUPED);

    await selectById(page, 'door');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => editorValue(page)).toContain('id="door" x="91"');
  });
});

test.describe('The view stays put', () => {
  test('dropping a shape in a scrolled, zoomed-in view does not scroll the view', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, GROUPED);
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Zoom in' }).click();
    const pane = page.locator('[data-testid="svg-preview"]').locator('xpath=../..');
    await pane.evaluate((el) => { el.scrollLeft = el.scrollWidth / 3; el.scrollTop = el.scrollHeight / 3; });
    await page.waitForTimeout(300);
    const scrolled = await pane.evaluate((el) => ({ left: el.scrollLeft, top: el.scrollTop }));
    expect(scrolled.left).toBeGreaterThan(0);

    await selectById(page, 'door');
    await drag(page, await centreOf(page, '#door'), 20, 0);
    await expect.poll(() => editorValue(page)).not.toBe(GROUPED);
    // Past the render debounce, when the jump used to happen.
    await page.waitForTimeout(800);
    expect(await pane.evaluate((el) => ({ left: el.scrollLeft, top: el.scrollTop }))).toEqual(scrolled);
  });
});

test.describe('Wheel zoom', () => {
  test('Ctrl+wheel zooms toward the pointer once the drawing is larger than the pane', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, GROUPED);
    for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Zoom in' }).click();
    await page.waitForTimeout(300);
    const pane = (await page.locator('[data-testid="svg-preview"]').locator('xpath=../..').boundingBox())!;
    // Off-centre, where a zoom about the middle would carry the spot away.
    const at = { x: pane.x + pane.width * 0.25, y: pane.y + pane.height * 0.3 };
    const spot = () => page.evaluate(({ x, y }) => {
      const r = document.querySelector('[data-testid="svg-preview"]')!.shadowRoot!.querySelector('svg')!.getBoundingClientRect();
      return { fx: (x - r.left) / r.width, fy: (y - r.top) / r.height };
    }, at);
    const before = await spot();
    await page.mouse.move(at.x, at.y);
    for (let i = 0; i < 2; i++) {
      await page.keyboard.down('Control');
      await page.mouse.wheel(0, -100);
      await page.keyboard.up('Control');
      await page.waitForTimeout(300);
    }
    const after = await spot();
    expect(after.fx).toBeCloseTo(before.fx, 2);
    expect(after.fy).toBeCloseTo(before.fy, 2);
  });

  test('a drawing sized 100% with no viewBox is magnified, not just given a bigger canvas', async ({ page }) => {
    // The shape of a Visio export: percentage size, absolute coordinates, no viewBox.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect id="a" x="20" y="20" width="120" height="60" fill="orange"/>
  <rect id="b" x="200" y="150" width="120" height="60" fill="green"/>
</svg>`;
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, svg);
    const width = async () => (await page.locator('[data-testid="svg-preview"] #b').boundingBox())!.width;
    const before = await width();
    const at = await centreOf(page, '#b');
    await page.mouse.move(at.x, at.y);
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -100);
    await page.keyboard.up('Control');
    await expect.poll(width).toBeGreaterThan(before * 1.2);
  });
});

test.describe('After an undo the preview is whole', () => {
  test('undo right after a nudge keeps the drawing sized, dressed and selected', async ({ page }) => {
    // viewBox only: the preview sizes it, and a render it does not dress shows nothing.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect id="r" x="20" y="20" width="60" height="60" fill="teal"/>
  <circle cx="150" cy="150" r="20" fill="orange"/>
</svg>`;
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, svg);
    await selectById(page, 'r');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Control+z');
    await expect.poll(() => editorValue(page)).toBe(svg);
    await page.waitForTimeout(600);

    const state = await page.evaluate(() => {
      const root = document.querySelector('[data-testid="svg-preview"]')!.shadowRoot!;
      const s = root.querySelector('svg')!;
      const box = s.getBoundingClientRect();
      return { w: box.width, h: box.height, border: s.style.border, selected: root.querySelectorAll('[data-esvg-selected]').length };
    });
    expect(state.w).toBeGreaterThan(100);
    expect(state.h).toBeGreaterThan(100);
    expect(state.border).not.toBe('');
    expect(state.selected).toBe(1);

    // And editing goes on from there.
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => editorValue(page)).toContain('id="r" x="21"');
  });
});

test.describe('Touch', () => {
  test.use({ hasTouch: true });
  test.skip(({ browserName }) => browserName !== 'chromium', 'touch is driven through the Chrome DevTools Protocol');

  test('with a shape selected, a finger elsewhere scrolls and a finger on it drags', async ({ page, context }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="#eef"/>
  <rect id="a" x="40" y="40" width="80" height="80" fill="teal"/>
</svg>`;
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, svg);
    for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Zoom in' }).click();
    const pane = page.locator('[data-testid="svg-preview"]').locator('xpath=../..');
    await pane.evaluate((el) => { el.scrollTop = 200; el.scrollLeft = 0; });
    await selectById(page, 'a');

    const cdp = await context.newCDPSession(page);
    const swipe = async (x: number, y: number, dx: number, dy: number) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let i = 1; i <= 10; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / 10, y: y + dy * i / 10 }] });
        await page.waitForTimeout(16);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(400);
    };

    // Elsewhere on the drawing: the pane scrolls, and nothing moves.
    const box = (await pane.boundingBox())!;
    const before = await pane.evaluate((el) => el.scrollTop);
    await swipe(box.x + box.width * 0.7, box.y + box.height * 0.7, 0, -150);
    expect(await pane.evaluate((el) => el.scrollTop)).toBeGreaterThan(before + 50);
    expect(await editorValue(page)).toBe(svg);

    // On the selection: it moves, and the pane stays where it is. Scrolled
    // back to the top first, since the swipe above may have carried it out of view.
    await pane.evaluate((el) => { el.scrollTop = 0; });
    await page.waitForTimeout(200);
    const a = await page.locator('[data-testid="svg-preview"] #a').boundingBox();
    const scrolled = await pane.evaluate((el) => el.scrollTop);
    await swipe(a!.x + a!.width / 2, a!.y + a!.height / 2, 60, 0);
    await expect.poll(() => editorValue(page)).not.toBe(svg);
    expect(await editorValue(page)).toMatch(/<rect id="a" x="\d+" y="40"/);
    expect(await pane.evaluate((el) => el.scrollTop)).toBe(scrolled);
  });
});

test.describe('Pinch zoom', () => {
  const zoomLabel = async (page: Page) => parseInt(
    (await page.locator('[data-testid="preview-panel"]').getByText(/^\d+%$/).first().innerText()), 10);

  test('a touchpad pinch zooms by how far the fingers moved, not a level per event', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, GROUPED);
    await page.getByLabel('Reset zoom').click();
    await expect.poll(() => zoomLabel(page)).toBe(100);
    const at = await centreOf(page, '#door');
    await page.mouse.move(at.x, at.y);
    // A light pinch: thirty tiny Ctrl+wheel events, the way a touchpad sends them.
    await page.keyboard.down('Control');
    for (let i = 0; i < 30; i++) await page.mouse.wheel(0, -2);
    await page.keyboard.up('Control');
    await expect.poll(() => zoomLabel(page)).toBeGreaterThan(160);
    expect(await zoomLabel(page)).toBeLessThan(200);
    // The figure shows over the drawing while it zooms.
    await expect(page.getByTestId('zoom-badge')).toBeVisible();
  });

  test('a mouse notch is still one step', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, GROUPED);
    await page.getByLabel('Reset zoom').click();
    await expect.poll(() => zoomLabel(page)).toBe(100);
    const at = await centreOf(page, '#door');
    await page.mouse.move(at.x, at.y);
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -100);
    await page.keyboard.up('Control');
    await expect.poll(() => zoomLabel(page)).toBe(125);
  });

  test.describe('on a touch screen', () => {
    test.use({ hasTouch: true });
    test.skip(({ browserName }) => browserName !== 'chromium', 'touch is driven through the Chrome DevTools Protocol');

    test('two fingers zoom the drawing, not the page', async ({ page, context }) => {
      await page.goto('/');
      await waitForEditor(page);
      await setSvgContent(page, GROUPED);
      await page.getByLabel('Reset zoom').click();
      await expect.poll(() => zoomLabel(page)).toBe(100);
      const c = await centreOf(page, '#wall');
      const cdp = await context.newCDPSession(page);
      const fingers = (d: number) => [{ x: c.x - d, y: c.y, id: 0 }, { x: c.x + d, y: c.y, id: 1 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: fingers(40) });
      for (let d = 45; d <= 80; d += 5) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: fingers(d) });
        await page.waitForTimeout(16);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      // Fingers twice as far apart: about twice the zoom, and the page itself untouched.
      await expect.poll(() => zoomLabel(page)).toBeGreaterThan(170);
      expect(await zoomLabel(page)).toBeLessThan(230);
      expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(1);
      expect(await editorValue(page)).toBe(GROUPED);
    });

    test('a second finger during a drag ends it where it is, without the shape jumping', async ({ page, context }) => {
      await page.goto('/');
      await waitForEditor(page);
      await setSvgContent(page, GROUPED);
      await selectById(page, 'wall');
      const w = (await page.locator('[data-testid="svg-preview"] #wall').boundingBox())!;
      const start = { x: w.x + w.width / 4, y: w.y + w.height / 4 };
      const cdp = await context.newCDPSession(page);
      const touch = (type: string, touchPoints: { x: number; y: number; id: number }[]) =>
        cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
      // One finger drags the wall a little way...
      await touch('touchStart', [{ ...start, id: 0 }]);
      for (let i = 1; i <= 6; i++) {
        await touch('touchMove', [{ x: start.x + 5 * i, y: start.y, id: 0 }]);
        await page.waitForTimeout(16);
      }
      const wall = page.locator('[data-testid="svg-preview"] #wall');
      await expect(wall).not.toHaveAttribute('x', '40');
      const moved = await wall.getAttribute('x');
      // ...then a second finger lands on it, turning the gesture into a pinch.
      const at = { x: start.x + 30, y: start.y };
      await touch('touchStart', [{ ...at, id: 0 }, { x: at.x + 40, y: at.y + 10, id: 1 }]);
      // The wall stays where the first finger put it — no snapping back...
      expect(await wall.getAttribute('x')).toBe(moved);
      await touch('touchMove', [{ x: at.x - 10, y: at.y, id: 0 }, { x: at.x + 60, y: at.y + 10, id: 1 }]);
      await touch('touchEnd', []);
      // ...and the move is in the code, preview and code agreeing.
      await expect.poll(() => editorValue(page)).toContain(`<rect id="wall" x="${moved}"`);
      await expect(wall).toHaveAttribute('x', moved!);
    });
  });

  test('the toolbar stops at the same limit the wheel does', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, GROUPED);
    const zoomIn = page.getByRole('button', { name: 'Zoom in' });
    for (let i = 0; i < 16; i++) await zoomIn.click();
    await expect.poll(() => zoomLabel(page)).toBe(10000);
  });

  test('Safari\'s own pinch events zoom the drawing', async ({ page }) => {
    // A Mac trackpad pinch in Safari arrives as gesture events, never as
    // Ctrl+wheel. Sent by hand here, the way Safari would.
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, GROUPED);
    await page.getByLabel('Reset zoom').click();
    await expect.poll(() => zoomLabel(page)).toBe(100);
    const prevented = await page.evaluate(() => {
      const pane = document.querySelector('[data-testid="svg-preview"]')!.parentElement!.parentElement!;
      const send = (type: string, scale: number) => {
        const e = Object.assign(new Event(type, { bubbles: true, cancelable: true }), { scale, clientX: 300, clientY: 300 });
        pane.dispatchEvent(e);
        return e.defaultPrevented;
      };
      const all = [send('gesturestart', 1)];
      for (const s of [1.2, 1.4, 1.6, 1.8, 2]) all.push(send('gesturechange', s));
      all.push(send('gestureend', 2));
      return all.every(Boolean);
    });
    // Kept from the browser, which would otherwise zoom the page.
    expect(prevented).toBe(true);
    await expect.poll(() => zoomLabel(page)).toBe(200);
  });
});
