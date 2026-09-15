import { describe, it, expect } from 'vitest';
import { elideEmbeddedData, embeddedToken, restoreEmbeddedArgs, restoreEmbeddedData } from '../embedded-data';
import { buildSvgContext, executeReadTool } from '../svg-ai';

/**
 * A photo embedded as base64 is megabytes on one line. It reached the model whole through a
 * search or a line read and overflowed the context window; the model is now shown a token in its
 * place, and whatever it writes back gets the data restored before an edit is applied.
 */

/** Base64-looking text of `n` chars. The seed holds "qr", which a search for a QR code finds. */
const base64 = (n: number) => 'iVBORw0KGgoqrQRAAAANSUhEUg'.repeat(Math.ceil(n / 26)).slice(0, n);
const PHOTO = `data:image/png;base64,${base64(4_000)}`;
const DOC = [
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 900 500">',
  `  <image id="photo" x="0" y="0" width="300" height="300" xlink:href="${PHOTO}"/>`,
  '  <text id="title" x="8" y="480">Hello</text>',
  '</svg>',
].join('\n');

describe('elideEmbeddedData', () => {
  it('shows a short token in place of the data, keeping every line where it was', () => {
    const elided = elideEmbeddedData(DOC);
    expect(elided).not.toContain('iVBORw0KGgo');
    expect(elided).toContain(`xlink:href="${embeddedToken(PHOTO)}"`);
    expect(embeddedToken(PHOTO)).toMatch(/^⟦embedded image\/png 3 KB #[0-9a-f]{8}⟧$/);
    expect(elided.split('\n')).toHaveLength(DOC.split('\n').length);
  });

  it('leaves a data URI too short to matter alone', () => {
    const tiny = '<image href="data:image/gif;base64,R0lGODlhAQABAAAAACw="/>';
    expect(elideEmbeddedData(tiny)).toBe(tiny);
  });

  it('names the same data the same way every time, and different data differently', () => {
    expect(embeddedToken(PHOTO)).toBe(embeddedToken(PHOTO));
    expect(embeddedToken(`data:image/png;base64,${base64(3_999)}A`)).not.toBe(embeddedToken(PHOTO));
  });
});

describe('restoreEmbeddedData', () => {
  it('puts the data back where the model copied a token', () => {
    const rewritten = `  <image id="photo" x="100" y="0" width="300" height="300" xlink:href="${embeddedToken(PHOTO)}"/>`;
    const restored = restoreEmbeddedData(rewritten, DOC);
    expect(restored.unknown).toEqual([]);
    expect(restored.text).toBe(rewritten.replace(embeddedToken(PHOTO), PHOTO));
  });

  it('resolves a token by its id even when the label around it was paraphrased', () => {
    const id = embeddedToken(PHOTO).match(/#([0-9a-f]{8})/)![1];
    expect(restoreEmbeddedData(`href="⟦embedded a photo #${id}⟧"`, DOC).text).toBe(`href="${PHOTO}"`);
  });

  it('reports a token the document does not hold and leaves it unrestored', () => {
    const restored = restoreEmbeddedData('href="⟦embedded image/png 1 MB #deadbeef⟧"', DOC);
    expect(restored.unknown).toEqual(['⟦embedded image/png 1 MB #deadbeef⟧']);
  });

  it('resolves a token whose id the model wrote in capitals', () => {
    const id = embeddedToken(PHOTO).match(/#([0-9a-f]{8})/)![1];
    expect(restoreEmbeddedData(`href="⟦embedded image/png #${id.toUpperCase()}⟧"`, DOC).text).toBe(`href="${PHOTO}"`);
  });

  it('reports a token garbled past recognition rather than writing its label', () => {
    const id = embeddedToken(PHOTO).match(/#([0-9a-f]{8})/)![1];
    for (const garbled of [`⟦embedded image/png #${id.slice(1)}⟧`, `⟦embedded image/png ${id}⟧`, `⟦embedded image/png #${id}`]) {
      expect(restoreEmbeddedData(`href="${garbled}"`, DOC).unknown, garbled).toHaveLength(1);
    }
  });

  it('reaches strings nested anywhere in a tool call’s arguments', () => {
    const args = { edits: [{ selector: '#photo', position: 'after', svg: `<image href="${embeddedToken(PHOTO)}"/>` }] };
    const restored = restoreEmbeddedArgs(args, DOC);
    expect(restored.unknown).toEqual([]);
    expect(restored.args.edits[0].svg).toBe(`<image href="${PHOTO}"/>`);
  });
});

describe('what the model reads of a document with an embedded photo', () => {
  const BIG_PHOTO = `data:image/png;base64,${base64(1_500_000)}`;
  const BIG = DOC.replace(PHOTO, BIG_PHOTO);

  it('gets a token, not megabytes, in the context — and is told what the token means', () => {
    const context = buildSvgContext(BIG);
    expect(context.length).toBeLessThan(5_000);
    expect(context).toContain(embeddedToken(BIG_PHOTO));
    expect(context).toContain('copy the token exactly');
    expect(context).not.toContain('iVBORw0KGgo');
  });

  it('does not find a search term inside the base64', () => {
    // "qr" is in the base64 seed: a search for the QR code used to return the whole photo.
    expect(executeReadTool('search_svg', { query: 'qr' }, BIG)).toBe('No matches found for "qr".');
  });

  it('reads the photo’s line as a token, at its own line number', () => {
    const result = executeReadTool('read_svg_lines', { start: 1, end: 4 }, BIG)!;
    expect(result).toContain(`2:   <image id="photo" x="0" y="0" width="300" height="300" xlink:href="${embeddedToken(BIG_PHOTO)}"/>`);
    expect(result.length).toBeLessThan(2_000);
  });

  it('caps a read that would still be enormous: long lines clipped, the rest cut on a line boundary', () => {
    // A traced drawing: no embedded data, just a hundred 20 KB paths.
    const path = `  <path d="M0 0 ${'L1 1 '.repeat(4_000)}"/>`;
    const traced = ['<svg xmlns="http://www.w3.org/2000/svg">', ...Array(100).fill(path), '</svg>'].join('\n');
    const result = executeReadTool('read_svg_lines', { start: 1, end: 102 }, traced)!;
    expect(result.length).toBeLessThanOrEqual(60_000);
    expect(result).toContain('more chars on this line, not shown');
    expect(result).toContain('truncated here');
    expect(result).toContain('do NOT rewrite them with replace_lines');
  });

  it('finds a long line whole when the result is small enough to send', () => {
    // A match can be copied into replace_lines; clipped, the copy would lose the rest of the line.
    const path = `  <path id="outline" d="M0 0 ${'L1 1 '.repeat(1_000)}" fill="red"/>`;
    const doc = ['<svg xmlns="http://www.w3.org/2000/svg">', path, '</svg>'].join('\n');
    expect(executeReadTool('search_svg', { query: 'outline' }, doc)).toBe(`2: ${path}`);
  });
});
