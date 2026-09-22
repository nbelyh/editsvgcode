import { describe, it, expect } from 'vitest';
import { describePathParts, pathParts, planPathSplits, splitRiskOf, subpathsOf, type SplitRisk } from '../path-parts';
import { validateSvg } from '../svg-dom';
import { executeReadTool, planStructuralEdits, isStructuralEditTool } from '../svg-ai';

/**
 * A traced drawing packs several parts of the picture into one path, so "colour the trunk" had
 * nothing to address and the model recoloured whole paths. Splitting must give each part its
 * own path WITHOUT changing a pixel, which is what the rendering checks below hold it to.
 */

const PLAIN: SplitRisk = { evenOdd: false, stroked: false, translucent: false };

/** Is (x, y) filled by these outlines, under this fill rule? Winding number over the polygons. */
function filled(polys: Array<Array<[number, number]>>, evenOdd: boolean, x: number, y: number): boolean {
  let winding = 0;
  for (const poly of polys) {
    for (let k = 0; k < poly.length; k++) {
      const [ax, ay] = poly[k], [bx, by] = poly[(k + 1) % poly.length];
      if (ay <= y) {
        if (by > y && (bx - ax) * (y - ay) - (x - ax) * (by - ay) > 0) winding++;
      } else if (by <= y && (bx - ax) * (y - ay) - (x - ax) * (by - ay) < 0) winding--;
    }
  }
  return evenOdd ? winding % 2 !== 0 : winding !== 0;
}

function polysOf(d: string): Array<Array<[number, number]>> {
  const subs = subpathsOf(d);
  if ('error' in subs) throw new Error(subs.error);
  return subs.map((s) => s.poly);
}

/** Every point of a grid over the drawing is filled the same before and after the split. */
function expectSamePixels(d: string, risk: SplitRisk) {
  const parts = pathParts(d, risk);
  if ('error' in parts) throw new Error(parts.error);
  const before = polysOf(d);
  const after = parts.map((p) => polysOf(p.d));
  const xs = before.flat().map(([x]) => x), ys = before.flat().map(([, y]) => y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let differ = 0;
  for (let i = 0; i <= 80; i++) {
    for (let j = 0; j <= 80; j++) {
      // Off the grid lines, so no sample sits exactly on an edge.
      const x = x0 + ((x1 - x0) * (i + 0.37)) / 81, y = y0 + ((y1 - y0) * (j + 0.61)) / 81;
      if (filled(before, risk.evenOdd, x, y) !== after.some((poly) => filled(poly, risk.evenOdd, x, y))) differ++;
    }
  }
  expect(differ).toBe(0);
  return parts;
}

const square = (x: number, y: number, s: number, clockwise = true) => clockwise
  ? `M${x} ${y} h${s} v${s} h${-s} z`
  : `M${x} ${y} v${s} h${s} v${-s} z`;

describe('subpathsOf', () => {
  it('starts every subpath with an absolute moveto, so it draws the same on its own', () => {
    const subs = subpathsOf('m10 10 l5 0 l0 5 z m20 0 l5 0 l0 5 z');
    if ('error' in subs) throw new Error(subs.error);
    expect(subs.map((s) => s.text)).toEqual(['M10 10 l5 0 l0 5 z', 'M30 10 l5 0 l0 5 z']);
  });

  it('keeps the pairs after a relative moveto relative', () => {
    const subs = subpathsOf('M0 0 h5 v5 z m10 0 5 0 0 5 z');
    if ('error' in subs) throw new Error(subs.error);
    expect(subs[1].text).toBe('M10 0 l 5 0 0 5 z');
  });

  it('reads compact arc flags and exponents', () => {
    const subs = subpathsOf('M0 0a5 5 0 011e1 0z');
    if ('error' in subs) throw new Error(subs.error);
    expect(subs[0].box.maxX).toBeCloseTo(10);
    expect(subs[0].box.minY).toBeLessThan(-4);
  });

  it('reports data it cannot read', () => {
    expect(subpathsOf('L 5 5')).toEqual({ error: expect.stringContaining('moveto') });
  });
});

describe('pathParts', () => {
  it('separates shapes that sit apart', () => {
    const parts = expectSamePixels(`${square(0, 0, 10)} ${square(20, 0, 10)} ${square(40, 0, 10)}`, PLAIN);
    expect(parts).toHaveLength(3);
  });

  it('keeps a hole with the outline it is cut into', () => {
    const parts = expectSamePixels(`${square(0, 0, 30)} ${square(10, 10, 10, false)} ${square(50, 0, 10)}`, PLAIN);
    expect(parts.map((p) => p.subpaths)).toEqual([2, 1]);
  });

  it('frees an island inside a hole, and it still fills where it did', () => {
    const d = `${square(0, 0, 60)} ${square(10, 10, 40, false)} ${square(20, 20, 20)}`;
    expect(expectSamePixels(d, PLAIN)).toHaveLength(2);
  });

  it('keeps a hole cut into an island with the island, however deep it sits', () => {
    // An eye: face, socket, pupil, and the highlight cut out of the pupil. Windings alternate all
    // the way down, so a test on alternation alone freed the highlight as a solid blob.
    const d = `${square(0, 0, 80)} ${square(10, 10, 60, false)} ${square(20, 20, 40)} ${square(30, 30, 20, false)}`;
    expect(expectSamePixels(d, PLAIN).map((p) => p.subpaths)).toEqual([2, 2]);
  });

  it('keeps the island under evenodd, where the depth could be misjudged', () => {
    const d = `${square(0, 0, 60)} ${square(10, 10, 40, false)} ${square(20, 20, 20)}`;
    expect(expectSamePixels(d, { ...PLAIN, evenOdd: true })).toHaveLength(1);
  });

  it('keeps overlapping outlines together when they wind against each other', () => {
    const d = `${square(0, 0, 20)} ${square(10, 5, 20, false)}`;
    expect(expectSamePixels(d, PLAIN)).toHaveLength(1);
  });

  it('keeps overlapping outlines together when drawing them apart could show — evenodd, stroke, opacity', () => {
    const d = `${square(0, 0, 20)} ${square(10, 5, 20)}`;
    expect(pathParts(d, PLAIN)).toHaveLength(2);
    for (const risk of [{ ...PLAIN, evenOdd: true }, { ...PLAIN, stroked: true }, { ...PLAIN, translucent: true }]) {
      expect(expectSamePixels(d, risk)).toHaveLength(1);
    }
  });

  it('keeps stroked outlines together when their strokes meet, though their boxes only touch', () => {
    // Apart, the second part's fill would paint over half of the first one's stroke.
    const d = `${square(0, 0, 10)} ${square(10, 0, 10)}`;
    expect(pathParts(d, PLAIN)).toHaveLength(2);
    expect(pathParts(d, { ...PLAIN, stroked: true, strokeWidth: 2 })).toHaveLength(1);
    expect(pathParts(d, { ...PLAIN, stroked: true })).toHaveLength(1);
    expect(pathParts(`${square(0, 0, 10)} ${square(30, 0, 10)}`, { ...PLAIN, stroked: true, strokeWidth: 2 })).toHaveLength(2);
  });

  it('finds the hole in a ring drawn with arcs', () => {
    const ring = 'M0 50 A50 50 0 1 1 100 50 A50 50 0 1 1 0 50 Z M30 50 A20 20 0 1 0 70 50 A20 20 0 1 0 30 50 Z';
    const parts = expectSamePixels(`${ring} M150 50 a10 10 0 1 1 20 0 a10 10 0 1 1 -20 0z`, PLAIN);
    expect(parts.map((p) => p.subpaths)).toEqual([2, 1]);
  });

  it('splits relative traced data without moving anything', () => {
    // Shaped like potrace output: relative curves, holes wound the other way, parts side by side.
    const d = 'M10 10c20 0 30 10 30 30s-10 30-30 30-30-10-30-30 10-30 30-30z m0 20c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10z'
      + ' m60 -20c10 0 20 10 20 20s-10 20-20 20-20-10-20-20 10-20 20-20z';
    expect(expectSamePixels(d, PLAIN)).toHaveLength(2);
  });
});

const TRACED = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">',
  `  <path d="${square(0, 0, 30)} ${square(10, 10, 10, false)} ${square(50, 0, 10)}" transform="translate(5,5)" style="fill: #1C1817;"/>`,
  '</svg>',
].join('\n');

describe('split_path', () => {
  it('is planned like the other element edits', () => {
    expect(isStructuralEditTool('split_path')).toBe(true);
  });

  it('gives each part its own path, keeping every attribute, and recolours the parts named', () => {
    const { planned, available } = planStructuralEdits(TRACED, 'split_path', {
      edits: [{ selector: '/svg[1]/path[1]', fills: [{ part: 2, fill: '#A97C50' }] }],
    });
    expect(available).toBe(true);
    expect(planned[0].status).toBe('applied');
    // A note on an applied edit is shown as "applied, but with no visible effect".
    expect(planned[0].detail).toBeUndefined();
    const [range] = planned[0].ranges;
    const after = TRACED.slice(0, range.start) + range.replacement + TRACED.slice(range.end);
    expect(after.split('\n')).toEqual([
      TRACED.split('\n')[0],
      `  <path d="M0 0 h30 v30 h-30 z M10 10 v10 h10 v-10 z" transform="translate(5,5)" style="fill: #1C1817;"/>`,
      `  <path d="M50 0 h10 v10 h-10 z" transform="translate(5,5)" style="fill: #A97C50;"/>`,
      '</svg>',
    ]);
  });

  it('writes the fill into the style attribute, which beats both fill= and a <style> rule', () => {
    const doc = TRACED.replace(' style="fill: #1C1817;"', ' fill="#000"');
    const { planned } = planStructuralEdits(doc, 'split_path', { edits: [{ selector: 'path', fills: [{ part: 1, fill: 'red' }] }] });
    expect(planned[0].ranges[0].replacement).toContain('fill="#000" style="fill: red;"');
  });

  it('numbers the ids of the new parts after the original', () => {
    const doc = TRACED.replace('<path ', '<path id="tree" ');
    const { planned } = planStructuralEdits(doc, 'split_path', { edits: [{ selector: '#tree', fills: [] }] });
    expect(planned[0].ranges[0].replacement).toMatch(/id="tree".*\n.*id="tree-2"/);
  });

  it('refuses what it cannot split without changing the picture', () => {
    const cases: Array<[string, string]> = [
      [TRACED.replace(' style="fill: #1C1817;"', ' fill="url(#g)"'), 'gradient'],
      [TRACED.replace('<path ', '<path marker-end="url(#m)" '), 'markers'],
      [TRACED.replace(/d="[^"]*"/, `d="${square(0, 0, 10)}"`), 'one shape'],
      [TRACED.replace('</svg>', `  <path d="${square(0, 0, 10)} ${square(20, 0, 10)}"/>\n</svg>`), 'matches 2 elements'],
    ];
    for (const [doc, why] of cases) {
      const { planned } = planStructuralEdits(doc, 'split_path', { edits: [{ selector: 'path', fills: [] }] });
      expect(planned[0], why).toMatchObject({ status: 'failed', detail: expect.stringContaining(why) });
    }
  });

  it('refuses a path whose id something else refers to, which would reach only one part', () => {
    const withId = TRACED.replace('<path ', '<path id="tree" ');
    const docs = [
      withId.replace('<path ', '<style>#tree { stroke: red; }</style>\n  <path '),
      withId.replace('</svg>', '  <use href="#tree" x="100"/>\n</svg>'),
      withId.replace('</svg>', '  <rect clip-path="url(#tree)" width="5" height="5"/>\n</svg>'),
    ];
    for (const doc of docs) {
      const { planned } = planStructuralEdits(doc, 'split_path', { edits: [{ selector: '#tree', fills: [] }] });
      expect(planned[0], doc).toMatchObject({ status: 'failed', detail: expect.stringContaining('referred to elsewhere') });
    }
    // An id nothing points at is fine: the parts are numbered after it.
    expect(planStructuralEdits(withId.replace('<path ', '<style>#treetop { fill: red; }</style>\n  <path '), 'split_path', { edits: [{ selector: '#tree', fills: [] }] })
      .planned[0].status).toBe('applied');
  });

  it('refuses a part number the path does not have', () => {
    const result = planPathSplits(TRACED, [{ selector: 'path', fills: [{ part: 7, fill: '#fff' }] }]);
    expect(result.outcomes[0]).toMatchObject({ status: 'failed', detail: expect.stringContaining('1 to 2') });
  });
});

describe('splitRiskOf', () => {
  const riskOf = (attrs: string) => {
    const doc = validateSvg(`<svg xmlns="http://www.w3.org/2000/svg"><path ${attrs} d="M0 0h1v1z"/></svg>`).doc!;
    return splitRiskOf(doc.getElementsByTagName('path')[0], doc);
  };

  it('counts a fill colour with an alpha below one as translucent, however it is written', () => {
    for (const fill of ['rgba(0,0,0,.5)', 'rgb(0 0 0 / 50%)', 'hsla(0, 0%, 0%, 0.2)', '#0008', '#00000080', 'transparent']) {
      expect(riskOf(`fill="${fill}"`).translucent, fill).toBe(true);
    }
    expect(riskOf('style="fill: rgba(0,0,0,.5)"').translucent).toBe(true);
    expect(riskOf('fill="currentColor" color="rgba(0,0,0,.5)"').translucent).toBe(true);
  });

  it('counts an opaque colour as opaque', () => {
    for (const fill of ['#000', '#1C1817', 'black', 'rgba(0,0,0,1)', 'rgb(1 2 3)', '#000f']) {
      expect(riskOf(`fill="${fill}"`).translucent, fill).toBe(false);
    }
  });

  it('knows the stroke width in the path’s units, and says when it does not', () => {
    expect(riskOf('stroke="red" stroke-width="3"')).toMatchObject({ stroked: true, strokeWidth: 3 });
    expect(riskOf('stroke="red" stroke-width="3px"').strokeWidth).toBeUndefined();
  });
});

describe('list_path_parts', () => {
  it('lists each part with where it sits in the path', () => {
    const result = executeReadTool('list_path_parts', { selector: 'path' }, TRACED)!;
    expect(result).toContain('/svg[1]/path[1] (line 2): 2 separate parts');
    expect(result).toMatch(/part 1: x=0 y=0 w=30 h=30 — centred 25% across, 50% down; 50% of the path's box; 2 subpaths kept together/);
    expect(result).toContain('part 2: x=50 y=0 w=10 h=10');
    expect(result).toContain('say in your reply which parts you took for what');
  });

  it('tells the leaves of a traced tree from its trunk by where they sit', () => {
    // The live suite's tree: seven small leaves above a forked trunk, all one path.
    const trunk = 'M46 100 L46 62 C46 56 43 51 37 46 L40 43 C45 47 48 51 50 55 C52 51 55 47 60 43 L63 46 C57 51 54 56 54 62 L54 100 Z';
    const leaves = [[50, 10], [34, 16], [66, 16], [22, 28], [78, 28], [38, 32], [62, 32]]
      .map(([cx, cy]) => `M${cx - 8} ${cy} a8 5 0 1 0 16 0 a8 5 0 1 0 -16 0 Z`);
    const doc = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${[...leaves, trunk].join(' ')}" transform="translate(10,5)" style="fill: #1C1817;"/></svg>`;
    const listing = describePathParts(doc, 'path');
    expect(listing).toContain('8 separate parts');
    // Listed largest first: the trunk, tall and low in the middle, then leaves of one size.
    expect(listing).toMatch(/part 8: x=37 y=43 w=26 h=57 — centred 50% across, 70% down/);
    expect(listing.match(/w=16 h=10/g)).toHaveLength(7);
  });

  it('says when a path is one shape', () => {
    expect(describePathParts(TRACED.replace(/d="[^"]*"/, `d="${square(0, 0, 10)}"`), 'path')).toContain('one shape');
  });
});
