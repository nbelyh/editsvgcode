import { parseSvg, sizedMarkup, renderImage, type Align } from './svg-export';

/**
 * Favicon and app icons from the drawing: the files a site's <head> points at, the way current
 * guides lay them out — a favicon.ico for whatever asks for /favicon.ico, an SVG favicon for the
 * browsers that take one, a 180 px icon for iPhone home screens, and 192 and 512 px icons for a
 * web app manifest.
 *
 * Browsers cannot write .ico or .zip, but neither needs much: an .ico is a short index in front
 * of ordinary PNGs (which Windows and every browser accept inside one), and a zip of files that
 * are already compressed only has to store them.
 */

/** The sizes inside favicon.ico. Larger icons come from their own files, so these are enough. */
export const ICO_SIZES = [16, 32, 48];

export interface IconOptions {
  /** Where a drawing that is not square sits in the square. */
  align: Align;
  /** A CSS colour, or null for transparent. */
  background: string | null;
}

/** iOS shows a transparent home-screen icon on black, so that one icon is never transparent. */
export function appleTouchBackground(background: string | null): string {
  return background ?? '#ffffff';
}

/** An .ico holding the PNGs as they are. A size of 256 or more is written as 0, as the format says. */
export function icoFile(images: { size: number; png: Uint8Array }[]): Uint8Array {
  let offset = 6 + 16 * images.length;
  const out = new Uint8Array(offset + images.reduce((n, i) => n + i.png.length, 0));
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true);  // reserved
  view.setUint16(2, 1, true);  // 1 = icon
  view.setUint16(4, images.length, true);
  images.forEach((image, i) => {
    const at = 6 + 16 * i;
    out[at] = image.size >= 256 ? 0 : image.size;
    out[at + 1] = image.size >= 256 ? 0 : image.size;
    view.setUint16(at + 4, 1, true);   // colour planes
    view.setUint16(at + 6, 32, true);  // bits per pixel
    view.setUint32(at + 8, image.png.length, true);
    view.setUint32(at + 12, offset, true);
    out.set(image.png, offset);
    offset += image.png.length;
  });
  return out;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const b of bytes) crc = CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** A zip that stores the files without compressing them — PNGs are compressed already. */
export function zipFile(files: { name: string; data: Uint8Array }[], date = new Date()): Uint8Array {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const crc = crc32(file.data);
    const local = new Uint8Array(30 + name.length + file.data.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);         // version needed
    lv.setUint16(6, 0x0800, true);     // names are UTF-8
    lv.setUint16(8, 0, true);          // stored
    lv.setUint16(10, time, true);
    lv.setUint16(12, day, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, file.data.length, true);
    lv.setUint32(22, file.data.length, true);
    lv.setUint16(26, name.length, true);
    local.set(name, 30);
    local.set(file.data, 30 + name.length);

    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);         // version made by
    cv.setUint16(6, 20, true);         // version needed
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, time, true);
    cv.setUint16(14, day, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, file.data.length, true);
    cv.setUint32(24, file.data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    central.set(name, 46);

    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  const centralSize = centrals.reduce((n, c) => n + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  const out = new Uint8Array(offset + centralSize + end.length);
  let at = 0;
  for (const part of [...locals, ...centrals, end]) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

const escapeAttr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * The SVG favicon: the drawing in a square, placed as chosen, on the background when there is
 * one — the drawing nested whole inside an outer square that carries the colour.
 */
export function iconSvg(svg: string, options: IconOptions): string | { error: string } {
  const parsed = parseSvg(svg);
  if ('error' in parsed) return parsed;
  const square = sizedMarkup(parsed.doc, parsed.root, { width: 512, height: 512 }, options.align);
  if (!options.background) return square;
  const inner = parseSvg(square);
  if ('error' in inner) return inner;
  return '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">'
    + `<rect width="512" height="512" fill="${escapeAttr(options.background)}"/>`
    + new XMLSerializer().serializeToString(inner.root)
    + '</svg>';
}

/** The lines for the site's <head>. favicon.ico says 32x32 so Chrome picks the SVG over it. */
export const HEAD_SNIPPET = [
  '<link rel="icon" href="/favicon.ico" sizes="32x32">',
  '<link rel="icon" href="/icon.svg" type="image/svg+xml">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
  '<link rel="manifest" href="/site.webmanifest">',
].join('\n');

export const MANIFEST = JSON.stringify({
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
}, null, 2);

async function squarePng(svg: string, size: number, align: Align, background: string | null): Promise<Uint8Array | { error: string }> {
  const result = await renderImage(svg, { size: { width: size, height: size }, format: 'png', background, align });
  if ('error' in result) return result;
  return new Uint8Array(await result.blob.arrayBuffer());
}

/** favicon.ico alone. */
export async function faviconIco(svg: string, options: IconOptions): Promise<Uint8Array | { error: string }> {
  const images: { size: number; png: Uint8Array }[] = [];
  for (const size of ICO_SIZES) {
    const png = await squarePng(svg, size, options.align, options.background);
    if ('error' in png) return png;
    images.push({ size, png });
  }
  return icoFile(images);
}

/** Every file, zipped, with the <head> lines alongside so they are not lost. */
export async function iconSetZip(svg: string, options: IconOptions): Promise<Uint8Array | { error: string }> {
  const ico = await faviconIco(svg, options);
  if ('error' in ico) return ico;
  const vector = iconSvg(svg, options);
  if (typeof vector !== 'string') return vector;
  const pngs: { name: string; size: number; background: string | null }[] = [
    { name: 'apple-touch-icon.png', size: 180, background: appleTouchBackground(options.background) },
    { name: 'icon-192.png', size: 192, background: options.background },
    { name: 'icon-512.png', size: 512, background: options.background },
  ];
  const encoder = new TextEncoder();
  const files = [
    { name: 'favicon.ico', data: ico },
    { name: 'icon.svg', data: encoder.encode(vector) },
  ];
  for (const p of pngs) {
    const png = await squarePng(svg, p.size, options.align, p.background);
    if ('error' in png) return png;
    files.push({ name: p.name, data: png });
  }
  files.push({ name: 'site.webmanifest', data: encoder.encode(MANIFEST) });
  files.push({ name: 'head.html', data: encoder.encode(`${HEAD_SNIPPET}\n`) });
  return zipFile(files);
}
