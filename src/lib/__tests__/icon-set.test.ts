import { describe, it, expect } from 'vitest';
import { crc32, icoFile, zipFile, iconSvg, appleTouchBackground, HEAD_SNIPPET, MANIFEST } from '../icon-set';

const bytes = (text: string) => new TextEncoder().encode(text);

/** The files in a stored zip, read the way an unzipper does: from the central directory. */
function unzip(zip: Uint8Array): Record<string, Uint8Array> {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const end = zip.length - 22;
  expect(view.getUint32(end, true)).toBe(0x06054b50);
  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  const files: Record<string, Uint8Array> = {};
  for (let i = 0; i < count; i++) {
    expect(view.getUint32(at, true)).toBe(0x02014b50);
    const size = view.getUint32(at + 24, true);
    const nameLength = view.getUint16(at + 28, true);
    const local = view.getUint32(at + 42, true);
    const name = new TextDecoder().decode(zip.subarray(at + 46, at + 46 + nameLength));
    expect(view.getUint32(local, true)).toBe(0x04034b50);
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    files[name] = zip.subarray(start, start + size);
    expect(crc32(files[name])).toBe(view.getUint32(at + 16, true));
    at += 46 + nameLength;
  }
  return files;
}

describe('crc32', () => {
  it('matches the standard check values', () => {
    expect(crc32(bytes('123456789'))).toBe(0xcbf43926);
    expect(crc32(bytes(''))).toBe(0);
  });
});

describe('icoFile', () => {
  it('indexes each PNG by size and points at it', () => {
    const a = Uint8Array.from([1, 2, 3]);
    const b = Uint8Array.from([4, 5]);
    const ico = icoFile([{ size: 16, png: a }, { size: 256, png: b }]);
    const view = new DataView(ico.buffer);
    expect([view.getUint16(0, true), view.getUint16(2, true), view.getUint16(4, true)]).toEqual([0, 1, 2]);
    expect([ico[6], ico[7]]).toEqual([16, 16]);
    expect([ico[22], ico[23]]).toEqual([0, 0]); // 256 is written as 0
    expect(view.getUint16(6 + 6, true)).toBe(32);
    const offsetA = view.getUint32(6 + 12, true);
    const offsetB = view.getUint32(22 + 12, true);
    expect(Array.from(ico.subarray(offsetA, offsetA + view.getUint32(6 + 8, true)))).toEqual([1, 2, 3]);
    expect(Array.from(ico.subarray(offsetB, offsetB + view.getUint32(22 + 8, true)))).toEqual([4, 5]);
  });
});

describe('zipFile', () => {
  it('stores the files so any unzipper gets them back exactly', () => {
    const files = unzip(zipFile([
      { name: 'a.txt', data: bytes('hello') },
      { name: 'dir/é.bin', data: Uint8Array.from([0, 255, 7]) },
    ]));
    expect(Object.keys(files)).toEqual(['a.txt', 'dir/é.bin']);
    expect(new TextDecoder().decode(files['a.txt'])).toBe('hello');
    expect(Array.from(files['dir/é.bin'])).toEqual([0, 255, 7]);
  });
});

describe('iconSvg', () => {
  const WIDE = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>';

  it('squares the drawing, placed as chosen', () => {
    const out = iconSvg(WIDE, { align: 'top', background: null });
    expect(out).toContain('width="512"');
    expect(out).toContain('height="512"');
    expect(out).toContain('preserveAspectRatio="xMidYMin meet"');
  });

  it('puts a background behind it, with the drawing nested whole', () => {
    const out = iconSvg(WIDE, { align: 'center', background: '#ff0000' }) as string;
    expect(out).toMatch(/^<svg [^>]*viewBox="0 0 512 512"><rect width="512" height="512" fill="#ff0000"\/><svg /);
    expect(new DOMParser().parseFromString(out, 'image/svg+xml').querySelector('parsererror')).toBeNull();
  });
});

describe('the files the <head> lines name', () => {
  it('never leaves the iPhone icon transparent', () => {
    expect(appleTouchBackground(null)).toBe('#ffffff');
    expect(appleTouchBackground('#123456')).toBe('#123456');
  });

  it('names every file the zip has, and the manifest names the app icons', () => {
    for (const file of ['favicon.ico', 'icon.svg', 'apple-touch-icon.png', 'site.webmanifest']) expect(HEAD_SNIPPET).toContain(`/${file}`);
    expect(JSON.parse(MANIFEST).icons.map((i: { src: string }) => i.src)).toEqual(['/icon-192.png', '/icon-512.png']);
  });
});
