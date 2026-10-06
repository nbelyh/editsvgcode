import { test, expect, type Page } from '@playwright/test';
import { waitForEditor } from '../support/helpers';

/**
 * get_png_image's renderer, through its DEV window hook. jsdom has no canvas, so this is
 * the only place the picture itself can be checked: pixels are read back out of the PNG.
 */

/** Two squares in one group: a match inside a group must show while its sibling fades. */
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
  <g>
    <rect id="a" x="10" y="10" width="60" height="60" fill="#ff0000"/>
    <rect id="b" x="120" y="10" width="60" height="60" fill="#0000ff"/>
  </g>
</svg>`;

interface Shot { text: string; dataUrl?: string; width?: number; height?: number; pixels?: Record<string, number[]> }

/** Render, then read the given pixels (in picture coordinates) out of the PNG. */
async function render(page: Page, options: unknown, probes: Record<string, [number, number]> = {}, svg = SVG): Promise<Shot> {
  return page.evaluate(async ({ svg, options, probes }) => {
    const shot = await (window as any).__test_renderSnapshot(svg, options);
    if (!shot.dataUrl) return shot;
    const img = new Image();
    await new Promise((resolve) => { img.onload = resolve; img.src = shot.dataUrl; });
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const pixels: Record<string, number[]> = {};
    for (const [name, [x, y]] of Object.entries(probes)) {
      pixels[name] = Array.from(ctx.getImageData(x, y, 1, 1).data.slice(0, 3));
    }
    return { ...shot, width: img.width, height: img.height, pixels };
  }, { svg, options, probes });
}

function near(actual: number[] | undefined, expected: number[], tolerance = 24) {
  expect(actual).toBeDefined();
  actual!.forEach((v, i) => expect(Math.abs(v - expected[i]), `channel ${i} of ${actual} vs ${expected}`).toBeLessThanOrEqual(tolerance));
}

test.describe('renderSnapshot', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
  });

  test('draws the whole drawing at the requested longest side', async ({ page }) => {
    // 200×100 at 256 → scale 1.28: #a's centre (40,40) lands at (51,51), #b's (150,40) at (192,51).
    const shot = await render(page, { size: 256 }, { a: [51, 51], b: [192, 51], gap: [128, 51] });
    expect(shot.width).toBe(256);
    expect(shot.height).toBe(128);
    expect(shot.text).toContain('256×128 PNG of the whole drawing (viewBox x=0, y=0, width=200, height=100)');
    near(shot.pixels!.a, [255, 0, 0]);
    near(shot.pixels!.b, [0, 0, 255]);
    near(shot.pixels!.gap, [255, 255, 255]); // transparent → white
  });

  test('defaults to 512 and snaps an odd size to the nearest offered one', async ({ page }) => {
    expect((await render(page, {})).width).toBe(512);
    expect((await render(page, { size: 900 })).width).toBe(1024);
  });

  test('highlights a match inside a group and fades its sibling', async ({ page }) => {
    // #a spans x 12.8–89.6 in the picture; 3px past its right edge is the outline.
    const shot = await render(page, { size: 256, highlight: '#a' }, { a: [51, 51], b: [192, 51], outline: [91, 51], away: [110, 51] });
    expect(shot.text).toContain('Magenta outline: 1 element matches "#a", at x=10, y=10, width=60, height=60 — /svg[1]/g[1]/rect[1] on line 3 with fill="#ff0000".');
    near(shot.pixels!.a, [255, 0, 0]);
    near(shot.pixels!.b, [191, 191, 255]); // a quarter of blue over white
    near(shot.pixels!.outline, [255, 0, 255], 60);
    near(shot.pixels!.away, [255, 255, 255]);
  });

  test('crops to a region and draws it at full size', async ({ page }) => {
    const shot = await render(page, { size: 256, crop: { x: 120, y: 10, width: 60, height: 60 } }, { centre: [128, 128], corner: [2, 2] });
    expect(shot.width).toBe(256);
    expect(shot.height).toBe(256);
    expect(shot.text).toContain('the region x=120, y=10, width=60, height=60');
    near(shot.pixels!.centre, [0, 0, 255]);
    near(shot.pixels!.corner, [0, 0, 255]);
  });

  test('highlights a match inside a nested <svg>', async ({ page }) => {
    // WebKit draws nothing under a hidden <svg>, so the hiding must leave every <svg> visible.
    const nested = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
      <svg x="0" y="0" width="200" height="100" viewBox="0 0 200 100">
        <rect id="a" x="10" y="10" width="60" height="60" fill="#ff0000"/>
        <rect id="b" x="120" y="10" width="60" height="60" fill="#0000ff"/>
      </svg>
    </svg>`;
    const shot = await render(page, { size: 256, highlight: '#a' }, { a: [51, 51], b: [192, 51] }, nested);
    near(shot.pixels!.a, [255, 0, 0]);
    near(shot.pixels!.b, [191, 191, 255]);
  });

  test('several addresses each get their own outline colour, named in the text', async ({ page }) => {
    // #a's right edge is at 89.6 and #b's at 230.4 in the picture; 3px past each is its ring.
    const shot = await render(page, { size: 256, highlight: ['#a', '#b'] }, { a: [51, 51], b: [192, 51], ringA: [91, 51], ringB: [232, 51] });
    expect(shot.text).toContain('Magenta outline: 1 element matches "#a"');
    expect(shot.text).toContain('Cyan outline: 1 element matches "#b"');
    near(shot.pixels!.a, [255, 0, 0]);
    near(shot.pixels!.b, [0, 0, 255]);
    near(shot.pixels!.ringA, [255, 0, 255], 60);
    near(shot.pixels!.ringB, [0, 200, 255], 60);
  });

  test('an address that matches nothing is reported while the others are still drawn', async ({ page }) => {
    const shot = await render(page, { size: 256, highlight: ['#nope', '#b'] }, { b: [192, 51], ringB: [232, 51] });
    expect(shot.dataUrl).toBeDefined();
    expect(shot.text).toContain('"#nope" matched no element');
    // Colours follow the order given, so #b keeps the second colour even with the first unmatched.
    expect(shot.text).toContain('Cyan outline: 1 element matches "#b"');
    near(shot.pixels!.ringB, [0, 200, 255], 60);
  });

  test('a line address highlights the element whose tag starts on that line', async ({ page }) => {
    // Line 1 is <svg>, line 2 <g>, line 3 #a — the model reads lines, and "line 3" is #a.
    const shot = await render(page, { size: 256, highlight: ['line 3'] }, { a: [51, 51], b: [192, 51] });
    expect(shot.text).toContain('Magenta outline: 1 element matches "line 3"');
    expect(shot.text).toContain('/svg[1]/g[1]/rect[1] on line 3');
    near(shot.pixels!.a, [255, 0, 0]);
    near(shot.pixels!.b, [191, 191, 255]);
  });

  test('reads arguments a model sent JSON-encoded inside strings', async ({ page }) => {
    // Qwen on OpenRouter sends "highlight": "[\"#a\", \"#b\"]", "crop": "{…}", "size": "256".
    // Read literally, every one of those looks failed and the model spent its rounds retrying.
    const shot = await render(page, { highlight: '["#a", "#b"]', crop: '{"x": 0, "y": 0, "width": 200, "height": 100}', size: '256' });
    expect(shot.width).toBe(256);
    expect(shot.text).toContain('Magenta outline: 1 element matches "#a"');
    expect(shot.text).toContain('Cyan outline: 1 element matches "#b"');
    expect(shot.text).toContain('the region x=0, y=0, width=200, height=100');
  });

  test('splits positional paths joined by commas into separate highlights', async ({ page }) => {
    const shot = await render(page, { highlight: '/svg[1]/g[1]/rect[1], /svg[1]/g[1]/rect[2]' });
    expect(shot.text).toContain('Magenta outline: 1 element matches "/svg[1]/g[1]/rect[1]"');
    expect(shot.text).toContain('Cyan outline: 1 element matches "/svg[1]/g[1]/rect[2]"');
  });

  test('says when a highlighted path is the base layer under the whole figure', async ({ page }) => {
    const traced = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
      '  <path d="M5 5 H95 V95 H5 Z" fill="#010D1A"/>',
      ...[10, 20, 30, 40, 50].map((x) => `  <path d="M${x} 10 h5 v5 h-5 Z" fill="#8a5a2a"/>`),
      '</svg>'].join('\n');
    const base = await render(page, { highlight: ['line 2'] }, {}, traced);
    expect(base.text).toContain('/svg[1]/path[1] is a base layer');
    const part = await render(page, { highlight: ['line 3'] }, {}, traced);
    expect(part.text).not.toContain('base layer');
    // Cropped close around a small part, the part fills most of the picture — but it is still
    // a small part of the drawing, and must not be called the base layer.
    const small = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
      '  <path d="M10 10 h5 v5 h-5 Z" fill="#8a5a2a"/>',
      ...[20, 30, 40, 50, 60, 70].map((x) => `  <path d="M${x} 10 h5 v5 h-5 Z" fill="#8a5a2a"/>`),
      '</svg>'].join('\n');
    const close = await render(page, { highlight: ['line 2'], crop: { x: 9, y: 9, width: 7, height: 7 } }, {}, small);
    expect(close.text).toContain('Magenta outline');
    expect(close.text).not.toContain('base layer');
  });

  test('more addresses than there are outline colours is refused', async ({ page }) => {
    const shot = await render(page, { highlight: ['#a', '#b', 'rect', 'g', 'svg'] });
    expect(shot.dataUrl).toBeUndefined();
    expect(shot.text).toContain('at most 4 addresses');
  });

  test('a highlight that matches nothing says so and draws nothing', async ({ page }) => {
    const shot = await render(page, { highlight: '#nope' });
    expect(shot.dataUrl).toBeUndefined();
    expect(shot.text).toContain('matched no element');
  });

  test('a positional path highlights the one element it names', async ({ page }) => {
    const shot = await render(page, { size: 256, highlight: '/svg[1]/g[1]/rect[2]' }, { a: [51, 51], b: [192, 51] });
    expect(shot.text).toContain('1 element matches');
    near(shot.pixels!.a, [255, 191, 191]);
    near(shot.pixels!.b, [0, 0, 255]);
  });
});
