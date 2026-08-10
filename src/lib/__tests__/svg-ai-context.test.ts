import { describe, it, expect } from 'vitest';
import { buildSvgContext } from '../svg-ai';

/**
 * The context sent to the model has to stay bounded in CHARACTERS, not just in
 * lines. Prod showed why: every drawing that hit the "SVG too large" wall was
 * under the 1000-line budget, so it was sent whole — minified and
 * raster-embedding files are a handful of enormous lines, and a 9-line 718 KB
 * document sailed past a budget that only counted lines.
 */

const CHAR_BUDGET = 100_000;
const MAX_LINE_CHARS = 1200;

const lineOf = (n: number, fill = 'x') => fill.repeat(n);
const linesOf = (count: number, width: number) =>
  Array.from({ length: count }, (_, i) => `<rect id="r${i}" d="${lineOf(width)}"/>`).join('\n');

/** What a clipped line is expected to look like, mirroring clipLine. */
const clipped = (line: string) =>
  line.length <= MAX_LINE_CHARS
    ? line
    : `${line.slice(0, MAX_LINE_CHARS)} [... ${line.length - MAX_LINE_CHARS} more chars on this line, not shown ...]`;

/**
 * Every numbered row in the context must be a WHOLE line of the source — either
 * verbatim or in its clipped-and-marked form. A row that is neither is a line
 * cut in half: it still reads as complete, so rewriting it drops the remainder.
 */
const expectNoHalfWrittenLines = (ctx: string, svg: string) => {
  const src = svg.split('\n');
  const numbered = ctx.split('\n').filter((row) => /^\d+: /.test(row));
  expect(numbered.length).toBeGreaterThan(0);
  for (const row of numbered) {
    const [, n, content] = /^(\d+): ([\s\S]*)$/.exec(row)!;
    expect(content).toBe(clipped(src[Number(n) - 1]));
  }
};

/** Fences must come in pairs, or the model sees an unterminated code block. */
const expectBalancedFences = (ctx: string) => {
  expect((ctx.match(/```/g) ?? []).length % 2).toBe(0);
};

describe('buildSvgContext — documents inside both budgets are untouched', () => {
  it('sends a small document in full', () => {
    const svg = '<svg>\n  <rect width="10" height="10"/>\n</svg>';
    const ctx = buildSvgContext(svg);
    expect(ctx).toContain('1: <svg>');
    expect(ctx).toContain('2:   <rect width="10" height="10"/>');
    expect(ctx).toContain('3: </svg>');
    expect(ctx).not.toContain('not shown');
  });

  it('does not clip a long line when the document as a whole fits', () => {
    // One 5 KB line: over the per-line cap, but the file is far inside the
    // char budget, so clipping would cost replace_lines for nothing.
    const long = `<path d="${lineOf(5000)}"/>`;
    const ctx = buildSvgContext(`<svg>\n${long}\n</svg>`);
    expect(ctx).toContain(long);
    expect(ctx).not.toContain('not shown');
  });
});

describe('buildSvgContext — oversized documents are excerpted, not sent whole', () => {
  it('bounds a minified single-line document', () => {
    // The shape that broke: 1 line, 300 KB.
    const svg = `<svg><path d="${lineOf(300_000)}"/></svg>`;
    const ctx = buildSvgContext(svg);
    expect(ctx.length).toBeLessThan(CHAR_BUDGET);
    expect(ctx).toContain('more chars on this line, not shown');
  });

  it('bounds a few-line raster-embedding document', () => {
    // 9 lines, ~720 KB — the real prod case.
    const svg = Array.from({ length: 9 }, (_, i) => `<image id="i${i}" href="${lineOf(80_000)}"/>`).join('\n');
    expect(svg.length).toBeGreaterThan(700_000);
    const ctx = buildSvgContext(svg);
    expect(ctx.length).toBeLessThan(CHAR_BUDGET);
  });

  it('excerpts a document that is over the char budget but under the line budget', () => {
    // 900 lines of 200 chars — comfortably inside LINE_BUDGET, 180 KB of text.
    const svg = linesOf(900, 200);
    expect(svg.length).toBeGreaterThan(CHAR_BUDGET);
    const ctx = buildSvgContext(svg);
    expect(ctx).toContain('showing excerpts');
    expect(ctx).toContain('omitted');
    expect(ctx.length).toBeLessThan(CHAR_BUDGET + 200);
  });

  it('still excerpts a long thin document, as it always did', () => {
    const ctx = buildSvgContext(linesOf(5000, 20));
    expect(ctx).toContain('showing excerpts');
    expect(ctx).toContain('omitted');
  });
});

describe('buildSvgContext — a clipped line is marked as unsafe to rewrite', () => {
  it('says how much of the line was withheld', () => {
    const svg = `<svg>\n<path d="${lineOf(200_000)}"/>\n</svg>`;
    const ctx = buildSvgContext(svg);
    expect(ctx).toMatch(/\[\.\.\. \d+ more chars on this line, not shown \.\.\.\]/);
  });

  it('warns the model off replace_lines for those lines', () => {
    const ctx = buildSvgContext(`<svg>\n<path d="${lineOf(200_000)}"/>\n</svg>`);
    expect(ctx).toContain('do NOT rewrite them with replace_lines');
  });

  it('keeps the warning off documents where nothing was clipped', () => {
    const ctx = buildSvgContext(linesOf(5000, 20));
    expect(ctx).not.toContain('do NOT rewrite them');
  });

  it('clips the quoted selection too', () => {
    const svg = linesOf(900, 200);
    const selected = `<path d="${lineOf(300_000)}"/>`;
    const ctx = buildSvgContext(svg, selected, { start: 5, end: 5 });
    expect(ctx).not.toContain(lineOf(MAX_LINE_CHARS + 1));
    expect(ctx.length).toBeLessThan(CHAR_BUDGET + 200);
  });
});

describe('buildSvgContext — the assembled context has a backstop', () => {
  // 2000 lines at the per-line cap; a 100-line selection pads out to ~200 lines
  // of ~1200 chars, which alone is twice the budget.
  const overflowing = linesOf(2000, 1300);
  const range = { start: 500, end: 600 };

  it('truncates when head, tail and a padded selection window together overflow', () => {
    const ctx = buildSvgContext(overflowing, undefined, range);
    expect(ctx).toContain('context truncated here');
    expect(ctx.length).toBeLessThanOrEqual(CHAR_BUDGET);
  });

  it('cuts on a line boundary, never mid-line', () => {
    // The hazard the backstop itself introduced: slicing at an exact character
    // count left a numbered line that looked whole but had been silently cut.
    expectNoHalfWrittenLines(buildSvgContext(overflowing, undefined, range), overflowing);
  });

  it('closes the code fence it opened', () => {
    expectBalancedFences(buildSvgContext(overflowing, undefined, range));
  });

  it('keeps the selection, and stays within budget, when both overflow', () => {
    const selected = linesOf(400, 1300);
    const ctx = buildSvgContext(overflowing, selected, range);
    expect(ctx).toContain('Selected element');
    expect(ctx.length).toBeLessThanOrEqual(CHAR_BUDGET);
    expectBalancedFences(ctx);
  });
});

describe('buildSvgContext — well-formed output on every path', () => {
  const cases: Array<[string, string]> = [
    ['small document', '<svg>\n  <rect/>\n</svg>'],
    ['minified one-liner', `<svg><path d="${lineOf(300_000)}"/></svg>`],
    ['few enormous lines', Array.from({ length: 9 }, (_, i) => `<image id="i${i}" href="${lineOf(80_000)}"/>`).join('\n')],
    ['over chars, under lines', linesOf(900, 200)],
    ['long and thin', linesOf(5000, 20)],
  ];

  for (const [name, svg] of cases) {
    it(`leaves no half-written line — ${name}`, () => {
      expectNoHalfWrittenLines(buildSvgContext(svg), svg);
    });

    it(`balances its fences — ${name}`, () => {
      expectBalancedFences(buildSvgContext(svg));
    });
  }
});

/**
 * The selection block is where "change THIS one" is decided. Line numbers alone
 * left the model choosing between a lookup call the prompt tells it not to
 * spend and a value selector that matches every element like the selected one.
 */
describe('buildSvgContext — the selection carries an address, not just line numbers', () => {
  const SVG = [
    '<svg xmlns="http://www.w3.org/2000/svg">',
    '  <rect fill="#ff0000" width="10"/>',
    '  <rect fill="#ff0000" width="20"/>',
    '</svg>',
  ].join('\n');

  it('states the address of the selected element', () => {
    const ctx = buildSvgContext(SVG, '<rect fill="#ff0000" width="20"/>', { start: 3, end: 3 });
    expect(ctx).toContain('address: /svg[1]/rect[2]');
    expect(ctx).toContain('lines 3-3');
  });

  it('warns against the value selector that would match both rects', () => {
    const ctx = buildSvgContext(SVG, '<rect fill="#ff0000" width="20"/>', { start: 3, end: 3 });
    expect(ctx).toMatch(/do NOT build a selector from its values/i);
  });

  it('carries the address on the excerpted path too', () => {
    // Oversized, so the context takes the head/tail branch — where the selection
    // matters most, since most of the document is not shown at all.
    const body = Array.from({ length: 400 }, (_, i) => `  <rect id="r${i}" d="${'x'.repeat(400)}"/>`);
    const big = ['<svg xmlns="http://www.w3.org/2000/svg">', ...body, '</svg>'].join('\n');
    expect(big.length).toBeGreaterThan(CHAR_BUDGET);
    const ctx = buildSvgContext(big, '<rect id="r200"/>', { start: 202, end: 202 });
    expect(ctx).toContain('address: #r200');
  });

  it('falls back to line numbers alone when the document does not parse', () => {
    const broken = '<svg>\n  <rect fill="red"\n</svg>';
    const ctx = buildSvgContext(broken, '<rect fill="red"', { start: 2, end: 2 });
    expect(ctx).toContain('Selected element (lines 2-2):');
    expect(ctx).not.toContain('address:');
  });

  it('says nothing about an address when there is no line range', () => {
    const ctx = buildSvgContext(SVG, '<rect fill="#ff0000" width="20"/>');
    expect(ctx).toContain('Selected element:');
    expect(ctx).not.toContain('address:');
  });
});
