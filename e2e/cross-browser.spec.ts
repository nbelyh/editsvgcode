import { test, expect } from '@playwright/test';
import { waitForEditor, setSvgContent } from './helpers';

test.describe('Cross-browser: Splitter resize', () => {
  test('dragging the splitter changes pane widths', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);

    // Allotment uses CSS modules with hashed class names
    const sash = page.locator('[class*="sash-module_sash"]').first();
    await expect(sash).toBeVisible({ timeout: 5000 });

    // Get the first pane's initial width
    const pane = page.locator('[class*="splitViewView"]').first();
    const initialBox = await pane.boundingBox();
    expect(initialBox).toBeTruthy();

    // Drag the sash 150px to the right
    const sashBox = await sash.boundingBox();
    expect(sashBox).toBeTruthy();
    await page.mouse.move(
      sashBox!.x + sashBox!.width / 2,
      sashBox!.y + sashBox!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      sashBox!.x + sashBox!.width / 2 + 150,
      sashBox!.y + sashBox!.height / 2,
      { steps: 10 }
    );
    await page.mouse.up();

    // First pane should now be wider
    const afterBox = await pane.boundingBox();
    expect(afterBox!.width).toBeGreaterThan(initialBox!.width + 50);
  });
});

test.describe('Cross-browser: ViewBox synthesis', () => {
  test('SVG without viewBox/width/height still renders in preview', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);

    // SVG with no width, height, or viewBox — exercises the synthesizeViewBox path
    await setSvgContent(page, '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="green"/></svg>');

    const circle = page.locator('[data-testid="svg-preview"] circle');
    await expect(circle).toBeVisible({ timeout: 10000 });

    // The preview should have synthesized a viewBox on the SVG element
    const viewBox = await page.locator('[data-testid="svg-preview"] svg').getAttribute('viewBox');
    expect(viewBox).toBeTruthy();
  });
});

test.describe('Cross-browser: Click-to-select', () => {
  test('clicking a preview element selects it in the editor', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <rect width="100" height="100" x="50" y="50" fill="orange"/>
</svg>`;
    await setSvgContent(page, svg);

    // Click the rect in the preview
    const rect = page.locator('[data-testid="svg-preview"] rect');
    await expect(rect).toBeVisible({ timeout: 10000 });
    await rect.click();

    // The editor should have a selection covering the <rect> tag
    const selection = await page.evaluate(() => {
      const editor = (window as any).__test_monaco_editor;
      if (!editor) return null;
      const sel = editor.getSelection();
      const model = editor.getModel();
      if (!sel || !model) return null;
      const text = model.getValueInRange(sel);
      return { startLine: sel.startLineNumber, text };
    });
    expect(selection).toBeTruthy();
    expect(selection!.text).toContain('<rect');
  });
});

test.describe('Cross-browser: Format document', () => {
  test('formatting poorly-indented SVG produces clean output', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);

    // Set poorly formatted SVG and format it via the exposed formatXml function
    await page.evaluate(() => {
      const editor = (window as any).__test_monaco_editor;
      const formatXml = (window as any).__test_formatXml;
      if (!editor || !formatXml) return;
      const raw = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/><circle cx="50" cy="50" r="30"/></svg>';
      editor.setValue(formatXml(raw));
    });

    const value: string = await page.evaluate(() => {
      const editor = (window as any).__test_monaco_editor;
      return editor?.getValue() ?? '';
    });
    const lines = value.split('\n').filter((l: string) => l.trim());
    expect(lines.length).toBeGreaterThanOrEqual(3);
    expect(value).toContain('  <rect');
    expect(value).toContain('  <circle');
  });
});
