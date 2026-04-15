import { test, expect } from '@playwright/test';
import { waitForEditor } from './helpers';

/**
 * Helper: call getElementBounds in the browser and return the raw output string.
 */
async function getBounds(page: import('@playwright/test').Page, svg: string, selector: string): Promise<string> {
  return page.evaluate(
    ({ svg, selector }) => (window as any).__test_getElementBounds(svg, selector),
    { svg, selector },
  );
}

test.describe('getElementBounds', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
  });

  test('returns bounds for a simple rect', async ({ page }) => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect x="10" y="20" width="100" height="50" fill="red"/></svg>';
    const result = await getBounds(page, svg, 'rect');
    expect(result).toContain('viewBox="0 0 200 200"');
    expect(result).toContain('<rect>');
    expect(result).toContain('x=10');
    expect(result).toContain('y=20');
    expect(result).toContain('width=100');
    expect(result).toContain('height=50');
  });

  test('applies transform to bounding box', async ({ page }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <g transform="translate(50 80) scale(2)">
        <rect x="0" y="0" width="10" height="5" fill="blue"/>
      </g>
    </svg>`;
    const result = await getBounds(page, svg, 'rect');
    // rect is 10×5 in local coords, scaled by 2 → 20×10 in viewBox coords
    // translated by (50,80) → x=50, y=80
    expect(result).toContain('width=20');
    expect(result).toContain('height=10');
    expect(result).toContain('x=50');
    expect(result).toContain('y=80');
  });

  test('handles nested transforms', async ({ page }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <g transform="translate(100 100)">
        <g transform="scale(3)">
          <rect x="0" y="0" width="10" height="10" fill="green"/>
        </g>
      </g>
    </svg>`;
    const result = await getBounds(page, svg, 'rect');
    // 10×10 * scale(3) = 30×30, translated to (100,100)
    expect(result).toContain('width=30');
    expect(result).toContain('height=30');
    expect(result).toContain('x=100');
    expect(result).toContain('y=100');
  });

  test('measures a group with multiple children', async ({ page }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <g transform="translate(50 80) scale(6)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <path d="M9 17h6"/>
        <circle cx="17" cy="17" r="2"/>
      </g>
    </svg>`;
    const result = await getBounds(page, svg, 'g');
    // The <g> bbox is roughly x=0..22, y=7..19 in local coords, scaled by 6
    // width should be ~120, height ~72, at roughly x=50, y=122
    // Use generous ranges since stroke/path rendering varies
    const widthMatch = result.match(/width=([\d.]+)/);
    const heightMatch = result.match(/height=([\d.]+)/);
    expect(widthMatch).not.toBeNull();
    expect(heightMatch).not.toBeNull();
    const width = parseFloat(widthMatch![1]);
    const height = parseFloat(heightMatch![1]);
    expect(width).toBeGreaterThan(100);
    expect(width).toBeLessThan(140);
    expect(height).toBeGreaterThan(60);
    expect(height).toBeLessThan(80);
  });

  test('returns error for missing SVG', async ({ page }) => {
    const result = await getBounds(page, '<div>not svg</div>', 'rect');
    expect(result).toContain('Error: no <svg> element found');
  });

  test('returns error for invalid selector', async ({ page }) => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>';
    const result = await getBounds(page, svg, '!!!invalid');
    expect(result).toContain('Error: invalid CSS selector');
  });

  test('returns message when no elements match', async ({ page }) => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>';
    const result = await getBounds(page, svg, 'circle');
    expect(result).toContain('No elements matched');
  });

  test('reports element id when present', async ({ page }) => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect id="myBox" x="5" y="5" width="20" height="20"/></svg>';
    const result = await getBounds(page, svg, '#myBox');
    expect(result).toContain('id="myBox"');
    expect(result).toContain('width=20');
  });

  test('handles multiple matching elements', async ({ page }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect x="0" y="0" width="10" height="10" fill="red"/>
      <rect x="50" y="50" width="20" height="20" fill="blue"/>
    </svg>`;
    const result = await getBounds(page, svg, 'rect');
    expect(result).toContain('(2 elements)');
    expect(result).toContain('1.');
    expect(result).toContain('2.');
  });

  test('handles rotation transform', async ({ page }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect transform="rotate(90 50 50)" x="40" y="40" width="20" height="10" fill="red"/>
    </svg>`;
    const result = await getBounds(page, svg, 'rect');
    // 20×10 rotated 90° → bounding box should be roughly 10×20
    const widthMatch = result.match(/width=([\d.]+)/);
    const heightMatch = result.match(/height=([\d.]+)/);
    expect(widthMatch).not.toBeNull();
    expect(heightMatch).not.toBeNull();
    const width = parseFloat(widthMatch![1]);
    const height = parseFloat(heightMatch![1]);
    expect(width).toBeCloseTo(10, 0);
    expect(height).toBeCloseTo(20, 0);
  });
});
