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
