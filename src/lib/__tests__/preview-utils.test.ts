import { describe, it, expect } from 'vitest';
import { sanitizeSvg } from '../sanitize';
import { stepUp, stepDown, isAbsoluteLength, resolveXPath, contentOverflowsViewport, bboxTracksViewport, selectionChain, nextInChain, stampSourcePaths, findBySourcePath, SOURCE_PATH_ATTR, LEVELS } from '../preview-utils';

// ---------------------------------------------------------------------------
// stepUp / stepDown (zoom levels)
// ---------------------------------------------------------------------------
describe('stepUp', () => {
  it('returns the next level above the given value', () => {
    expect(stepUp(100)).toBe(125);
  });

  it('returns 2 from 1', () => {
    expect(stepUp(1)).toBe(2);
  });

  it('returns next level for in-between values', () => {
    expect(stepUp(110)).toBe(125);
  });

  it('returns 1.5x for values beyond max level', () => {
    expect(stepUp(5000)).toBe(7500);
  });

  it('steps through all levels correctly', () => {
    let z = LEVELS[0];
    for (let i = 1; i < LEVELS.length; i++) {
      z = stepUp(z);
      expect(z).toBe(LEVELS[i]);
    }
  });
});

describe('stepDown', () => {
  it('returns the previous level below the given value', () => {
    expect(stepDown(100)).toBe(75);
  });

  it('returns 1 at minimum', () => {
    expect(stepDown(1)).toBe(1);
  });

  it('returns previous level for in-between values', () => {
    expect(stepDown(110)).toBe(100);
  });

  it('returns value/1.5 floored for values beyond max', () => {
    expect(stepDown(6000)).toBe(5000);
  });

  it('steps through all levels in reverse correctly', () => {
    let z = LEVELS[LEVELS.length - 1];
    for (let i = LEVELS.length - 2; i >= 0; i--) {
      z = stepDown(z);
      expect(z).toBe(LEVELS[i]);
    }
  });
});

// ---------------------------------------------------------------------------
// isAbsoluteLength
// ---------------------------------------------------------------------------
describe('isAbsoluteLength', () => {
  it('accepts plain numbers', () => {
    expect(isAbsoluteLength('100')).toBe(true);
  });

  it('accepts numbers with px suffix', () => {
    expect(isAbsoluteLength('200px')).toBe(true);
  });

  it('accepts decimal numbers', () => {
    expect(isAbsoluteLength('12.5')).toBe(true);
    expect(isAbsoluteLength('12.5px')).toBe(true);
  });

  it('accepts with leading/trailing whitespace', () => {
    expect(isAbsoluteLength('  100  ')).toBe(true);
    expect(isAbsoluteLength('  100px  ')).toBe(true);
  });

  it('rejects percentage values', () => {
    expect(isAbsoluteLength('50%')).toBe(false);
  });

  it('rejects em/rem/other units', () => {
    expect(isAbsoluteLength('2em')).toBe(false);
    expect(isAbsoluteLength('1rem')).toBe(false);
    expect(isAbsoluteLength('10vw')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isAbsoluteLength('')).toBe(false);
  });

  it('rejects non-numeric strings', () => {
    expect(isAbsoluteLength('auto')).toBe(false);
    expect(isAbsoluteLength('inherit')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contentOverflowsViewport
// ---------------------------------------------------------------------------
describe('contentOverflowsViewport', () => {
  it('reports no overflow when the drawing exactly fills the viewport', () => {
    // What percentage-laid-out content does: <rect width="100%" height="100%"/>
    expect(contentOverflowsViewport({ x: 0, y: 0, width: 631, height: 657 }, 631, 657)).toBe(false);
  });

  it('reports no overflow when the drawing is smaller than the viewport', () => {
    expect(contentOverflowsViewport({ x: 10, y: 10, width: 100, height: 100 }, 631, 657)).toBe(false);
  });

  it('reports overflow when absolute coordinates run past the viewport', () => {
    // The Visio-style export: width="100%" but content drawn at ~2679x1660
    expect(contentOverflowsViewport({ x: 0, y: 0, width: 2679, height: 1660 }, 631, 657)).toBe(true);
  });

  it('reports overflow when content sits above or left of the origin', () => {
    expect(contentOverflowsViewport({ x: -50, y: 0, width: 100, height: 100 }, 631, 657)).toBe(true);
    expect(contentOverflowsViewport({ x: 0, y: -50, width: 100, height: 100 }, 631, 657)).toBe(true);
  });

  it('tolerates a sub-pixel overhang from a stroke or descender', () => {
    expect(contentOverflowsViewport({ x: -0.5, y: 0, width: 631.5, height: 657.5 }, 631, 657)).toBe(false);
  });

  it('reports no overflow for an empty drawing', () => {
    expect(contentOverflowsViewport({ x: 0, y: 0, width: 0, height: 0 }, 631, 657)).toBe(false);
  });

  it('reports overflow for content flat on one axis but far outside', () => {
    // A single horizontal rule at y=1500: zero height, and off the pane entirely.
    expect(contentOverflowsViewport({ x: 0, y: 1500, width: 800, height: 0 }, 631, 657)).toBe(true);
    // The same flat shape inside the pane still needs no viewBox.
    expect(contentOverflowsViewport({ x: 0, y: 300, width: 400, height: 0 }, 631, 657)).toBe(false);
  });

  it('reports no overflow when the element cannot be measured', () => {
    expect(contentOverflowsViewport(null, 631, 657)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// bboxTracksViewport
// ---------------------------------------------------------------------------
describe('bboxTracksViewport', () => {
  it('sees percentage content follow the viewport it is given', () => {
    // <rect width="100%" height="100%"/> measured at the pane, then at half.
    expect(bboxTracksViewport(
      { x: 0, y: 0, width: 631, height: 657 },
      { x: 0, y: 0, width: 316, height: 329 },
    )).toBe(true);
  });

  it('sees absolute content stay put', () => {
    const bb = { x: 0, y: 0, width: 2679, height: 1660 };
    expect(bboxTracksViewport(bb, { ...bb })).toBe(false);
  });

  it('reads a deliberate bleed off a percentage backdrop as viewport-driven', () => {
    // <rect width="100%" height="100%"/> plus a circle at the origin, half of
    // which the browser clips. The left/top edge is fixed, the far edge is not.
    expect(bboxTracksViewport(
      { x: -200, y: -200, width: 831, height: 857 },
      { x: -200, y: -200, width: 516, height: 529 },
    )).toBe(true);
  });

  it('reads a diagram larger than the pane as absolute despite a percentage backdrop', () => {
    // The backdrop is inside the diagram's box, so the box does not move.
    const bb = { x: 0, y: 0, width: 4000, height: 2000 };
    expect(bboxTracksViewport(bb, { ...bb })).toBe(false);
  });

  it('ignores sub-pixel drift', () => {
    expect(bboxTracksViewport(
      { x: 0, y: 0, width: 2679, height: 1660 },
      { x: 0.5, y: 0, width: 2679.5, height: 1660 },
    )).toBe(false);
  });

  it('does not claim tracking when either measurement failed', () => {
    expect(bboxTracksViewport(null, { x: 0, y: 0, width: 10, height: 10 })).toBe(false);
    expect(bboxTracksViewport({ x: 0, y: 0, width: 10, height: 10 }, null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// resolveXPath
// ---------------------------------------------------------------------------
function makeSvg(html: string): SVGSVGElement {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.querySelector('svg') as SVGSVGElement;
}

describe('resolveXPath', () => {
  const svgHtml = '<svg><g><rect/><circle/><rect/></g><path/></svg>';

  it('resolves a direct child element', () => {
    const svg = makeSvg(svgHtml);
    const el = resolveXPath(svg, '/svg[1]/path[1]');
    expect(el).not.toBeNull();
    expect(el!.tagName.toLowerCase()).toBe('path');
  });

  it('resolves a nested element', () => {
    const svg = makeSvg(svgHtml);
    const el = resolveXPath(svg, '/svg[1]/g[1]/circle[1]');
    expect(el).not.toBeNull();
    expect(el!.tagName.toLowerCase()).toBe('circle');
  });

  it('resolves sibling by index', () => {
    const svg = makeSvg(svgHtml);
    const el = resolveXPath(svg, '/svg[1]/g[1]/rect[2]');
    expect(el).not.toBeNull();
    expect(el!.tagName.toLowerCase()).toBe('rect');
    // Should be the second rect, which is the third child of g
    const g = svg.querySelector('g')!;
    expect(el).toBe(g.children[2]);
  });

  it('returns null for non-existent path', () => {
    const svg = makeSvg(svgHtml);
    expect(resolveXPath(svg, '/svg[1]/g[1]/ellipse[1]')).toBeNull();
  });

  it('returns null for out-of-range index', () => {
    const svg = makeSvg(svgHtml);
    expect(resolveXPath(svg, '/svg[1]/g[1]/rect[5]')).toBeNull();
  });

  it('returns null for root svg xpath', () => {
    const svg = makeSvg(svgHtml);
    expect(resolveXPath(svg, '/svg[1]')).toBeNull();
  });

  it('handles xpath without leading svg step', () => {
    const svg = makeSvg(svgHtml);
    const el = resolveXPath(svg, '/g[1]/rect[1]');
    expect(el).not.toBeNull();
    expect(el!.tagName.toLowerCase()).toBe('rect');
  });

  it('returns null for empty xpath', () => {
    const svg = makeSvg(svgHtml);
    expect(resolveXPath(svg, '')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// selectionChain / nextInChain (click cycling)
// ---------------------------------------------------------------------------
describe('selectionChain', () => {
  it('runs from the top-level item down to the clicked element', () => {
    const svg = makeSvg('<svg><g id="a"><g id="b"><rect id="r"/></g><circle/></g><path/></svg>');
    const chain = selectionChain(svg.querySelector('#r')!, svg);
    expect(chain.map((e) => e.id)).toEqual(['a', 'b', 'r']);
  });

  it('is just the element when it sits directly under the root', () => {
    const svg = makeSvg('<svg><rect id="r"/><path/></svg>');
    expect(selectionChain(svg.querySelector('#r')!, svg).map((e) => e.id)).toEqual(['r']);
  });

  it('skips a group that wraps the whole drawing', () => {
    const svg = makeSvg('<svg><defs/><title>t</title><g id="all"><g id="part"><rect id="r"/></g><circle/></g></svg>');
    expect(selectionChain(svg.querySelector('#r')!, svg).map((e) => e.id)).toEqual(['part', 'r']);
  });

  it('skips nested wrappers, but never the clicked element itself', () => {
    const svg = makeSvg('<svg><g id="w1"><g id="w2"><rect id="r"/></g></g></svg>');
    expect(selectionChain(svg.querySelector('#r')!, svg).map((e) => e.id)).toEqual(['r']);
  });

  it('treats a run of text as part of its text element', () => {
    const svg = makeSvg('<svg><text id="t">a<tspan id="s">b</tspan></text><rect/></svg>');
    expect(selectionChain(svg.querySelector('#s')!, svg).map((e) => e.id)).toEqual(['t']);
  });

  it('is empty for an element outside the root', () => {
    const svg = makeSvg('<svg><rect/></svg>');
    const stray = makeSvg('<svg><rect id="x"/></svg>').querySelector('#x')!;
    expect(selectionChain(stray, svg)).toEqual([]);
  });
});

describe('nextInChain', () => {
  const svg = makeSvg('<svg><g id="a"><g id="b"><rect id="r"/><rect id="r2"/></g><circle id="c"/></g><path id="p"/></svg>');
  const $ = (id: string) => svg.querySelector(`#${id}`)!;
  const chain = selectionChain($('r'), svg);

  it('starts at the top when nothing is selected', () => {
    expect(nextInChain(chain, null)).toBe($('a'));
  });

  it('goes one level deeper on each click of the selection', () => {
    expect(nextInChain(chain, $('a'))).toBe($('b'));
    expect(nextInChain(chain, $('b'))).toBe($('r'));
  });

  it('wraps back to the top after the innermost element', () => {
    expect(nextInChain(chain, $('r'))).toBe($('a'));
  });

  it('stays at the same level when a sibling of the selection is clicked', () => {
    expect(nextInChain(chain, $('r2'))).toBe($('r'));
    expect(nextInChain(chain, $('c'))).toBe($('b'));
  });

  it('starts again from the top for an unrelated selection', () => {
    expect(nextInChain(chain, $('p'))).toBe($('a'));
  });

  it('is null for an empty chain', () => {
    expect(nextInChain([], null)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// stampSourcePaths / findBySourcePath
// ---------------------------------------------------------------------------
describe('stampSourcePaths', () => {
  const NS = 'xmlns="http://www.w3.org/2000/svg"';

  it('stamps every element with its positional path in the source', () => {
    const stamped = stampSourcePaths(`<svg ${NS}><g><rect/><rect/></g><circle/></svg>`)!;
    const svg = makeSvg(stamped);
    expect(Array.from(svg.querySelectorAll('*')).map((e) => e.getAttribute(SOURCE_PATH_ATTR)))
      .toEqual(['/svg[1]/g[1]', '/svg[1]/g[1]/rect[1]', '/svg[1]/g[1]/rect[2]', '/svg[1]/circle[1]']);
  });

  it('keeps an element\'s source path when the sanitizer lifts it out of its parent', () => {
    // Inkscape's flowed text: the sanitizer drops <flowRoot> and <flowRegion>
    // and keeps the rect inside, which then sits beside the drawing's own rect.
    const source = `<svg ${NS}><flowRoot><flowRegion><rect id="frame"/></flowRegion></flowRoot><rect id="real"/></svg>`;
    const svg = makeSvg(sanitizeSvg(stampSourcePaths(source)!));
    const real = svg.querySelector('#real')!;
    expect(real.getAttribute(SOURCE_PATH_ATTR)).toBe('/svg[1]/rect[1]');
    expect(findBySourcePath(svg, '/svg[1]/rect[1]')).toBe(real);
  });

  it('is null when the source does not parse', () => {
    expect(stampSourcePaths('<svg><rect></svg>')).toBeNull();
  });
});
