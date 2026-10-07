import { test, expect, type Page } from '@playwright/test';
import { waitForEditor, setSvgContent } from '../support/helpers';

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
