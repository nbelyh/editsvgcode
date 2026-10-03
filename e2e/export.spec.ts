import { test, expect, type Page, type Download } from '@playwright/test';
import { readFileSync } from 'fs';
import { waitForEditor, setSvgContent } from './helpers.js';

/**
 * Exporting the drawing as a picture, and copying it as code.
 *
 * Download only ever produced the .svg, and it is the most used action in the app. These check
 * what comes out, not just that something does: the pixel size each choice should give, that a
 * transparent background really is transparent, the file names, and what lands on the clipboard.
 */

/** 40 × 20, with a red box in the middle and nothing in the corners. */
const DRAWING = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><rect x="10" y="5" width="20" height="10" fill="red"/></svg>';

async function openExport(page: Page) {
  await page.goto('/');
  await waitForEditor(page);
  await setSvgContent(page, DRAWING);
  await page.getByRole('button', { name: 'Download' }).click();
}

/** The code panel, switched to one form of the code. */
async function openCode(page: Page, form: string) {
  await page.getByRole('menuitem', { name: 'Code (data URI, CSS, React)…' }).click();
  const dialog = page.getByRole('dialog', { name: 'Copy as code' });
  await dialog.getByText(form, { exact: true }).click();
  return dialog;
}

async function exportImage(page: Page): Promise<Download> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('dialog', { name: 'Export image' }).getByRole('button', { name: 'Download' }).click(),
  ]);
  return download;
}

/** Width and height from a PNG's header. */
function pngSize(bytes: Buffer): [number, number] {
  expect(bytes.subarray(1, 4).toString()).toBe('PNG');
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

/** One pixel of an image file, decoded by the browser. */
async function pixelAt(page: Page, bytes: Buffer, mime: string, x: number, y: number): Promise<number[]> {
  return page.evaluate(async ({ b64, mime, x, y }) => {
    const blob = await (await fetch(`data:${mime};base64,${b64}`)).blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0);
    return Array.from(ctx.getImageData(x, y, 1, 1).data);
  }, { b64: bytes.toString('base64'), mime, x, y });
}

/** The files in a zip that stores them, read from its central directory as an unzipper does. */
function unzip(zip: Buffer): Record<string, Buffer> {
  const end = zip.length - 22;
  expect(zip.readUInt32LE(end)).toBe(0x06054b50);
  let at = zip.readUInt32LE(end + 16);
  const files: Record<string, Buffer> = {};
  for (let i = 0; i < zip.readUInt16LE(end + 10); i++) {
    const size = zip.readUInt32LE(at + 24);
    const nameLength = zip.readUInt16LE(at + 28);
    const local = zip.readUInt32LE(at + 42);
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    files[zip.subarray(at + 46, at + 46 + nameLength).toString()] = zip.subarray(start, start + size);
    at += 46 + nameLength;
  }
  return files;
}

test.describe('Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie-consent', 'declined');
      // Every test starts from the defaults rather than whatever the last one chose.
      localStorage.removeItem('esvg-export-settings');
      localStorage.removeItem('esvg-icon-settings');
      localStorage.removeItem('esvg-copy-kind');
    });
  });

  test('Download shows every choice, and the .svg comes first and is unchanged', async ({ page }) => {
    await openExport(page);
    const items = page.getByRole('menuitem');
    await expect(items.first()).toHaveText('SVG file');
    await expect(items).toHaveText(['SVG file', 'Image (PNG, WebP)…', 'Favicon and app icons…', 'Code (data URI, CSS, React)…']);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      items.first().click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.svg$/);
    expect(readFileSync(await download.path())).toEqual(Buffer.from(DRAWING));
  });

  test('a PNG at 1× is the drawing’s own size, on a transparent background', async ({ page }) => {
    await openExport(page);
    await page.getByRole('menuitem', { name: 'Image (PNG, WebP)…' }).click();
    await expect(page.getByTestId('export-size')).toHaveText('40 × 20 px');

    const download = await exportImage(page);
    expect(download.suggestedFilename()).toMatch(/^[^@]+\.png$/);
    const bytes = readFileSync(await download.path());
    expect(pngSize(bytes)).toEqual([40, 20]);
    expect((await pixelAt(page, bytes, 'image/png', 1, 1))[3]).toBe(0);            // corner: see-through
    expect(await pixelAt(page, bytes, 'image/png', 20, 10)).toEqual([255, 0, 0, 255]); // middle: the red box
  });

  test('4× is four times the size, named @4x, and a white background fills the corners', async ({ page }) => {
    await openExport(page);
    await page.getByRole('menuitem', { name: 'Image (PNG, WebP)…' }).click();
    const dialog = page.getByRole('dialog', { name: 'Export image' });
    await dialog.getByText('4×').click();
    await dialog.getByText('White').click();
    await expect(page.getByTestId('export-size')).toHaveText('160 × 80 px');

    const download = await exportImage(page);
    expect(download.suggestedFilename()).toMatch(/@4x\.png$/);
    const bytes = readFileSync(await download.path());
    expect(pngSize(bytes)).toEqual([160, 80]);
    expect(await pixelAt(page, bytes, 'image/png', 2, 2)).toEqual([255, 255, 255, 255]);
  });

  test('a custom width keeps the proportions, and typing the height moves the width', async ({ page }) => {
    await openExport(page);
    await page.getByRole('menuitem', { name: 'Image (PNG, WebP)…' }).click();
    const dialog = page.getByRole('dialog', { name: 'Export image' });
    await dialog.getByText('Custom', { exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Keep proportions' })).toHaveAttribute('aria-pressed', 'true');
    await dialog.getByLabel('Height').fill('30');
    await expect(dialog.getByLabel('Width')).toHaveValue('60');
    await dialog.getByLabel('Width').fill('100');
    await expect(dialog.getByLabel('Height')).toHaveValue('50');
    await expect(page.getByTestId('export-size')).toHaveText('100 × 50 px');

    const download = await exportImage(page);
    expect(download.suggestedFilename()).toMatch(/-100x50\.png$/);
    expect(pngSize(readFileSync(await download.path()))).toEqual([100, 50]);
  });

  test('unlocked, a square box holds the wide drawing whole, where the position puts it', async ({ page }) => {
    await openExport(page);
    await page.getByRole('menuitem', { name: 'Image (PNG, WebP)…' }).click();
    const dialog = page.getByRole('dialog', { name: 'Export image' });
    await dialog.getByText('Custom', { exact: true }).click();
    await dialog.getByRole('button', { name: 'Keep proportions' }).click();
    await dialog.getByLabel('Width').fill('100');
    await dialog.getByLabel('Height').fill('100');
    await expect(page.getByTestId('export-size')).toHaveText('100 × 100 px');

    // Centred by default: the 100 × 50 drawing sits in the middle band, empty above and below.
    let bytes = readFileSync(await (await exportImage(page)).path());
    expect(pngSize(bytes)).toEqual([100, 100]);
    expect((await pixelAt(page, bytes, 'image/png', 50, 10))[3]).toBe(0);
    expect(await pixelAt(page, bytes, 'image/png', 50, 50)).toEqual([255, 0, 0, 255]);

    // At the top, the red box (rows 12–38 of the drawing at 2.5×) moves up and the middle row is empty.
    await expect(dialog).toBeHidden();
    await page.getByRole('button', { name: 'Download' }).click();
    await page.getByRole('menuitem', { name: 'Image (PNG, WebP)…' }).click();
    await dialog.getByRole('radio', { name: 'Top', exact: true }).click();
    bytes = readFileSync(await (await exportImage(page)).path());
    expect(await pixelAt(page, bytes, 'image/png', 50, 25)).toEqual([255, 0, 0, 255]);
    expect((await pixelAt(page, bytes, 'image/png', 50, 70))[3]).toBe(0);
  });

  test('WebP is offered only where the browser can write it, and then is a real WebP', async ({ page }) => {
    // Safari cannot encode WebP and quietly returns a PNG; offered there, it saved a PNG named .webp.
    await openExport(page);
    await page.getByRole('menuitem', { name: 'Image (PNG, WebP)…' }).click();
    const dialog = page.getByRole('dialog', { name: 'Export image' });
    const canWrite = await page.evaluate(() => {
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      return c.toDataURL('image/webp').startsWith('data:image/webp');
    });
    if (!canWrite) {
      await expect(dialog.getByText('WebP')).toHaveCount(0);
      return;
    }
    await dialog.getByText('WebP').click();

    const download = await exportImage(page);
    expect(download.suggestedFilename()).toMatch(/\.webp$/);
    const bytes = readFileSync(await download.path());
    expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
    expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
  });

  test('the panel previews the picture, and the background changes it', async ({ page }) => {
    await openExport(page);
    await page.getByRole('menuitem', { name: 'Image (PNG, WebP)…' }).click();
    const preview = page.getByTestId('export-preview');
    await expect(preview).toBeVisible({ timeout: 10000 });
    const corner = () => preview.evaluate(async (img: HTMLImageElement) => {
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      return Array.from(ctx.getImageData(1, 1, 1, 1).data);
    });
    expect((await corner())[3]).toBe(0);                                    // transparent by default
    await page.getByRole('dialog', { name: 'Export image' }).getByText('White').click();
    await expect.poll(corner, { timeout: 5000 }).toEqual([255, 255, 255, 255]);  // and white once chosen
  });

  test('the settings are remembered for next time', async ({ page }) => {
    await openExport(page);
    await page.getByRole('menuitem', { name: 'Image (PNG, WebP)…' }).click();
    await page.getByRole('dialog', { name: 'Export image' }).getByText('2×').click();
    await page.keyboard.press('Escape');
    // Closed, not just closing: its own Download button stays in the page through the animation.
    await expect(page.getByRole('dialog', { name: 'Export image' })).toBeHidden();

    await page.getByRole('button', { name: 'Download' }).click();
    await page.getByRole('menuitem', { name: 'Image (PNG, WebP)…' }).click();
    await expect(page.getByTestId('export-size')).toHaveText('80 × 40 px');
  });

  test('copying as code shows the code first, in whichever form is chosen, and remembers it', async ({ page }) => {
    await openExport(page);
    await page.getByRole('menuitem', { name: 'Code (data URI, CSS, React)…' }).click();
    const dialog = page.getByRole('dialog', { name: 'Copy as code' });
    const code = dialog.getByTestId('copy-code-preview');
    await expect(code).toContainText('<svg xmlns="http://www.w3.org/2000/svg"');   // the markup, at first
    await dialog.getByText('React', { exact: true }).click();
    // An unnamed drawing's only name is its generated id, which is no name for a component.
    await expect(code).toContainText('export default function SvgImage(props)');
    await expect(code).toContainText('<rect x="10" y="5" width="20" height="10" fill="red" />');

    await dialog.getByText('CSS', { exact: true }).click();
    await expect(code).toContainText('background-image: url("data:image/svg+xml');
    await expect(dialog.getByTestId('copy-code-length')).toContainText('characters');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await page.getByRole('button', { name: 'Download' }).click();
    await page.getByRole('menuitem', { name: 'Code (data URI, CSS, React)…' }).click();
    await expect(code).toContainText('background-image: url("data:image/svg+xml');
  });

  test('a drawing copied out of a web page, with no xmlns, exports as the preview shows it', async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await setSvgContent(page, DRAWING.replace(' xmlns="http://www.w3.org/2000/svg"', ''));
    await page.getByRole('button', { name: 'Download' }).click();
    await page.getByRole('menuitem', { name: 'Image (PNG, WebP)…' }).click();
    await expect(page.getByTestId('export-preview')).toBeVisible({ timeout: 10000 });

    const bytes = readFileSync(await (await exportImage(page)).path());
    expect(pngSize(bytes)).toEqual([40, 20]);
    expect(await pixelAt(page, bytes, 'image/png', 20, 10)).toEqual([255, 0, 0, 255]);
  });

  test('a colour still being typed is not drawn or saved', async ({ page }) => {
    await openExport(page);
    await page.getByRole('menuitem', { name: 'Image (PNG, WebP)…' }).click();
    const dialog = page.getByRole('dialog', { name: 'Export image' });
    await dialog.getByText('Colour', { exact: true }).click();
    await dialog.getByLabel('Background colour').fill('#ff');
    await expect(dialog.getByText('Not a colour yet')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Download' })).toBeDisabled();

    await dialog.getByLabel('Background colour').fill('#00ff00');
    await expect(dialog.getByRole('button', { name: 'Download' })).toBeEnabled();
    const bytes = readFileSync(await (await exportImage(page)).path());
    // Within a step or two: Safari's colour management turns pure green into 1, 255, 0.
    const [r, g, b, a] = await pixelAt(page, bytes, 'image/png', 1, 1);
    expect(Math.max(Math.abs(r), Math.abs(g - 255), Math.abs(b), Math.abs(a - 255))).toBeLessThanOrEqual(2);
  });

  test.describe('Favicon and app icons', () => {
    async function openIcons(page: Page) {
      await openExport(page);
      await page.getByRole('menuitem', { name: 'Favicon and app icons…' }).click();
      return page.getByRole('dialog', { name: 'Favicon and app icons' });
    }
    const download = async (page: Page, name: string) => {
      const [file] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('dialog', { name: 'Favicon and app icons' }).getByRole('button', { name }).click(),
      ]);
      return file;
    };

    test('favicon.ico holds 16, 32 and 48 px PNGs', async ({ page }) => {
      const dialog = await openIcons(page);
      await expect(dialog.getByTestId('icon-preview-16')).toBeVisible({ timeout: 10000 });
      // The drawing is wide, so where it sits in the square is a choice.
      await expect(dialog.getByRole('radio', { name: 'Centre' })).toHaveAttribute('aria-checked', 'true');

      const file = await download(page, 'favicon.ico');
      expect(file.suggestedFilename()).toBe('favicon.ico');
      const ico = readFileSync(await file.path());
      expect([ico.readUInt16LE(0), ico.readUInt16LE(2), ico.readUInt16LE(4)]).toEqual([0, 1, 3]);
      const sizes = [0, 1, 2].map((i) => {
        const entry = 6 + 16 * i;
        const png = ico.subarray(ico.readUInt32LE(entry + 12), ico.readUInt32LE(entry + 12) + ico.readUInt32LE(entry + 8));
        expect(pngSize(png)).toEqual([ico[entry], ico[entry + 1]]);
        return ico[entry];
      });
      expect(sizes).toEqual([16, 32, 48]);
    });

    test('the zip has every file the <head> lines name, square and placed', async ({ page }) => {
      const dialog = await openIcons(page);
      await expect(dialog.getByTestId('icon-head-snippet')).toContainText('<link rel="apple-touch-icon" href="/apple-touch-icon.png">');
      const file = await download(page, 'Download all (.zip)');
      expect(file.suggestedFilename()).toMatch(/-icons\.zip$/);
      const files = unzip(readFileSync(await file.path()));
      expect(Object.keys(files).sort()).toEqual(['apple-touch-icon.png', 'favicon.ico', 'head.html', 'icon-192.png', 'icon-512.png', 'icon.svg', 'site.webmanifest']);

      expect(pngSize(files['icon-192.png'])).toEqual([192, 192]);
      const big = files['icon-512.png'];
      expect(pngSize(big)).toEqual([512, 512]);
      // The 40 × 20 drawing, centred: empty above it, the red box in the middle.
      expect((await pixelAt(page, big, 'image/png', 256, 40))[3]).toBe(0);
      expect(await pixelAt(page, big, 'image/png', 256, 256)).toEqual([255, 0, 0, 255]);
      // Transparent was chosen, but iOS would show the iPhone icon on black, so it is white.
      const touch = files['apple-touch-icon.png'];
      expect(pngSize(touch)).toEqual([180, 180]);
      expect(await pixelAt(page, touch, 'image/png', 2, 2)).toEqual([255, 255, 255, 255]);

      expect(files['icon.svg'].toString()).toContain('preserveAspectRatio="xMidYMid meet"');
      expect(JSON.parse(files['site.webmanifest'].toString()).icons).toHaveLength(2);
    });
  });

  test.describe('Copy as', () => {
    // Reading the clipboard back needs permissions only Chromium grants to a test.
    test.skip(({ browserName }) => browserName !== 'chromium', 'clipboard read is Chromium-only in tests');
    test.beforeEach(async ({ context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    });

    const clipboardText = (page: Page) => page.evaluate(() => navigator.clipboard.readText());
    const copyShown = async (page: Page) => {
      await page.getByRole('dialog', { name: 'Copy as code' }).getByRole('button', { name: 'Copy' }).click();
    };

    test('a React component, ready to paste', async ({ page }) => {
      await openExport(page);
      await openCode(page, 'React');
      await copyShown(page);
      await expect(page.getByText('React component copied')).toBeVisible();
      const code = await clipboardText(page);
      expect(code).toMatch(/^export default function \w+\(props\) \{/);
      expect(code).toContain('{...props}');
      expect(code).toContain('<rect x="10" y="5" width="20" height="10" fill="red" />');
    });

    test('a data URI that decodes to the drawing', async ({ page }) => {
      await openExport(page);
      await openCode(page, 'Data URI');
      await copyShown(page);
      const uri = await clipboardText(page);
      expect(decodeURIComponent(uri.slice(uri.indexOf(',') + 1))).toBe(DRAWING);
    });

    test('Copy image puts a PNG on the clipboard', async ({ page }) => {
      await openExport(page);
      await page.getByRole('menuitem', { name: 'Image (PNG, WebP)…' }).click();
      await page.getByRole('dialog', { name: 'Export image' }).getByRole('button', { name: 'Copy image' }).click();
      await expect(page.getByText('Picture copied')).toBeVisible();
      const types = await page.evaluate(async () => (await navigator.clipboard.read()).flatMap((item) => item.types));
      expect(types).toContain('image/png');
    });
  });
});
