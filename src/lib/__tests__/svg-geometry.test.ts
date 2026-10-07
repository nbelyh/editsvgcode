import { describe, it, expect } from 'vitest';
import {
  parseTransform, listMatrix, multiply, invert, applyToPoint, decimalsFor, fmt, shifted,
  planMove, planResize, axisMaps, resizedBox, type ResizeRequest, type Rect,
} from '../svg-geometry';

/** Parse a document and return the element with id "t". */
function el(markup: string, extra = ''): Element {
  const doc = new DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg">${extra}${markup}</svg>`, 'image/svg+xml');
  const found = doc.getElementById('t') ?? doc.documentElement.lastElementChild;
  if (!found) throw new Error('no element');
  return found;
}

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 6);

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------
describe('parseTransform', () => {
  it('reads each function with its arguments and position', () => {
    const value = 'translate(364,94) rotate(30 10 20)';
    const list = parseTransform(value)!;
    expect(list.map((f) => f.name)).toEqual(['translate', 'rotate']);
    expect(list[0].args).toEqual([364, 94]);
    expect(list[1].args).toEqual([30, 10, 20]);
    expect(value.slice(list[1].start, list[1].end)).toBe('rotate(30 10 20)');
  });

  it('accepts comma separators between functions and exponents in numbers', () => {
    expect(parseTransform('scale(2) , translate(1e1 -.5)')!.map((f) => f.args)).toEqual([[2], [10, -0.5]]);
  });

  it('is empty for an empty value', () => {
    expect(parseTransform('  ')).toEqual([]);
  });

  it('refuses anything it cannot read rather than guessing', () => {
    expect(parseTransform('translate(1,2) wobble(3)')).toBeNull();
    expect(parseTransform('rotate(1, 2)')).toBeNull();
    expect(parseTransform('matrix(1 0 0 1 5)')).toBeNull();
  });
});

describe('matrices', () => {
  it('compose in SVG order: the rightmost function applies first', () => {
    const m = listMatrix(parseTransform('translate(10 0) scale(2)')!);
    expect(applyToPoint(m, 1, 1)).toEqual({ x: 12, y: 2 });
  });

  it('rotate about a centre keeps the centre fixed', () => {
    const m = listMatrix(parseTransform('rotate(90 50 50)')!);
    const p = applyToPoint(m, 50, 50);
    close(p.x, 50); close(p.y, 50);
    const q = applyToPoint(m, 60, 50);
    close(q.x, 50); close(q.y, 60);
  });

  it('invert undoes the matrix', () => {
    const m = listMatrix(parseTransform('translate(3 4) rotate(30) scale(2 3)')!);
    const id = multiply(invert(m)!, m);
    close(id.a, 1); close(id.b, 0); close(id.c, 0); close(id.d, 1); close(id.e, 0); close(id.f, 0);
  });

  it('a degenerate matrix has no inverse', () => {
    expect(invert({ a: 0, b: 0, c: 0, d: 0, e: 1, f: 1 })).toBeNull();
  });
});

describe('number formatting', () => {
  it('drops float noise, trailing zeros and negative zero', () => {
    expect(fmt(0.1 + 0.2)).toBe('0.3');
    expect(fmt(40)).toBe('40');
    expect(fmt(-0.0000001)).toBe('0');
  });

  it('writes whole numbers at 1:1 and more places only when zoomed in', () => {
    expect(decimalsFor(1)).toBe(0);
    expect(decimalsFor(0.25)).toBe(0);
    expect(decimalsFor(4)).toBe(1);
    expect(decimalsFor(10)).toBe(1);
    expect(decimalsFor(40)).toBe(2);
    expect(decimalsFor(1e9)).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// planMove
// ---------------------------------------------------------------------------
describe('planMove', () => {
  it('shifts a rectangle by its x and y', () => {
    expect(planMove(el('<rect x="40" y="10" width="5" height="5"/>'), 25, -5))
      .toEqual({ ok: true, attrs: { x: '65', y: '5' } });
  });

  it('leaves an axis alone when the move does not cross it', () => {
    expect(planMove(el('<rect x="40" y="10.25" width="5" height="5"/>'), 3, 0))
      .toEqual({ ok: true, attrs: { x: '43' } });
  });

  it('treats a missing position as 0', () => {
    expect(planMove(el('<rect width="5" height="5"/>'), 3, 4))
      .toEqual({ ok: true, attrs: { x: '3', y: '4' } });
  });

  it('moves circles and ellipses by their centre', () => {
    expect(planMove(el('<circle cx="10" cy="10" r="5"/>'), 1, 2)).toEqual({ ok: true, attrs: { cx: '11', cy: '12' } });
    expect(planMove(el('<ellipse cx="10" cy="10" rx="5" ry="3"/>'), 1, 2)).toEqual({ ok: true, attrs: { cx: '11', cy: '12' } });
  });

  it('moves both ends of a line', () => {
    expect(planMove(el('<line x1="0" y1="0" x2="10" y2="20"/>'), 5, 5))
      .toEqual({ ok: true, attrs: { x1: '5', x2: '15', y1: '5', y2: '25' } });
  });

  it('shifts every value of a text element positioned glyph by glyph', () => {
    expect(planMove(el('<text x="10 20 30" y="5">abc</text>'), 2, 0))
      .toEqual({ ok: true, attrs: { x: '12 22 32' } });
  });

  it('uses a transform for text whose runs place themselves', () => {
    expect(planMove(el('<text x="10" y="5"><tspan x="10" y="20">a</tspan></text>'), 2, 3))
      .toEqual({ ok: true, attrs: { transform: 'translate(2 3)' } });
  });

  it('updates a leading translate in place, keeping its comma', () => {
    expect(planMove(el('<path d="M0 0" transform="translate(364,94)"/>'), 25, -4))
      .toEqual({ ok: true, attrs: { transform: 'translate(389,90)' } });
  });

  it('changes a long coordinate by the distance moved and nothing else', () => {
    expect(planMove(el('<path d="M0 0" transform="translate(121.31122970581055,-0.511744499206543)"/>'), 5, 0))
      .toEqual({ ok: true, attrs: { transform: 'translate(126.31122970581055,-0.511744499206543)' } });
  });

  it('updates the leading translate and keeps what follows it', () => {
    expect(planMove(el('<g transform="translate(10 10) rotate(45)"/>'), 5, 0))
      .toEqual({ ok: true, attrs: { transform: 'translate(15 10) rotate(45)' } });
  });

  it('keeps a one-argument translate short when only x moves', () => {
    expect(planMove(el('<g transform="translate(10)"/>'), 5, 0))
      .toEqual({ ok: true, attrs: { transform: 'translate(15)' } });
  });

  it('moves a leading matrix by its translation', () => {
    expect(planMove(el('<text transform="matrix(1 0 0 1 120.5 40.2)">a</text>'), 10, -0.2))
      .toEqual({ ok: true, attrs: { transform: 'matrix(1 0 0 1 130.5 40)' } });
  });

  it('puts a translate in front of a path with no transform', () => {
    expect(planMove(el('<path d="M0 0 L5 5"/>'), 7, 8))
      .toEqual({ ok: true, attrs: { transform: 'translate(7 8)' } });
  });

  it('puts a translate in front of a transform that does not start with one', () => {
    expect(planMove(el('<polygon points="0,0 1,1 1,0" transform="scale(2)"/>'), 7, 8))
      .toEqual({ ok: true, attrs: { transform: 'translate(7 8) scale(2)' } });
  });

  it('moves a rotated rectangle by its local position, so it lands where it was dragged', () => {
    const rect = el('<rect x="0" y="0" width="10" height="10" transform="rotate(90)"/>');
    const plan = planMove(rect, 5, 0);
    // Rotated 90°, the parent's +x is the rect's local +y.
    expect(plan).toEqual({ ok: true, attrs: { y: '-5' } });
  });

  it('moves a scaled rectangle by its own units', () => {
    expect(planMove(el('<rect x="10" y="10" width="5" height="5" transform="scale(2)"/>'), 10, 0))
      .toEqual({ ok: true, attrs: { x: '15' } });
  });

  it('falls back to a transform when a position is not a plain number', () => {
    expect(planMove(el('<rect x="10%" y="5" width="5" height="5"/>'), 1, 1))
      .toEqual({ ok: true, attrs: { transform: 'translate(1 1)' } });
  });

  it('falls back to a transform when CSS sets the position', () => {
    expect(planMove(el('<rect class="c" x="1" y="1" width="5" height="5"/>', '<style>.c { x: 3px; }</style>'), 1, 1))
      .toEqual({ ok: true, attrs: { transform: 'translate(1 1)' } });
  });

  it('refuses an element whose transform CSS controls', () => {
    const inline = planMove(el('<rect style="transform: rotate(3deg)" width="5" height="5"/>'), 1, 1);
    expect(inline.ok).toBe(false);
    const rule = planMove(el('<path id="t" d="M0 0"/>', '<style>#t { transform-origin: center; }</style>'), 1, 1);
    expect(rule.ok).toBe(false);
  });

  it('refuses an animated element', () => {
    expect(planMove(el('<rect width="5" height="5"><animate attributeName="x" to="9"/></rect>'), 1, 1).ok).toBe(false);
  });

  it('refuses a transform it cannot read', () => {
    expect(planMove(el('<rect width="5" height="5" transform="translate(1,"/>'), 1, 1).ok).toBe(false);
  });

  it('changes nothing for a zero move', () => {
    expect(planMove(el('<rect x="1" width="5" height="5"/>'), 0, 0)).toEqual({ ok: true, attrs: {} });
  });
});

// ---------------------------------------------------------------------------
// Resizing
// ---------------------------------------------------------------------------
const req = (over: Partial<ResizeRequest>): ResizeRequest => ({
  handle: 'se', dx: 0, dy: 0, keepAspect: false,
  bbox: { x: 0, y: 0, width: 0, height: 0 }, minSize: 1, decimals: 0, ...over,
});

describe('axisMaps', () => {
  const box: Rect = { x: 10, y: 10, width: 100, height: 50 };

  it('pins the opposite corner', () => {
    expect(resizedBox(box, axisMaps(box, req({ handle: 'se', dx: 20, dy: 10 }))))
      .toEqual({ x: 10, y: 10, width: 120, height: 60 });
    expect(resizedBox(box, axisMaps(box, req({ handle: 'nw', dx: 20, dy: 10 }))))
      .toEqual({ x: 30, y: 20, width: 80, height: 40 });
  });

  it('leaves the other axis alone for a side handle', () => {
    expect(resizedBox(box, axisMaps(box, req({ handle: 'e', dx: 20, dy: 99 }))))
      .toEqual({ x: 10, y: 10, width: 120, height: 50 });
  });

  it('keeps the aspect ratio from a corner by following the larger stretch', () => {
    expect(resizedBox(box, axisMaps(box, req({ handle: 'se', dx: 100, dy: 0, keepAspect: true }))))
      .toEqual({ x: 10, y: 10, width: 200, height: 100 });
  });

  it('keeps the aspect ratio from a side by growing about the middle', () => {
    expect(resizedBox(box, axisMaps(box, req({ handle: 'e', dx: 100, keepAspect: true }))))
      .toEqual({ x: 10, y: -15, width: 200, height: 100 });
  });

  it('flips when dragged past the opposite side', () => {
    const maps = axisMaps(box, req({ handle: 'e', dx: -150 }));
    expect(maps.x.k).toBeLessThan(0);
    expect(resizedBox(box, maps)).toEqual({ x: -40, y: 10, width: 50, height: 50 });
  });

  it('never shrinks a side below the minimum', () => {
    expect(resizedBox(box, axisMaps(box, req({ handle: 'e', dx: -100, minSize: 2 }))).width).toBeCloseTo(2, 9);
  });

  it('leaves an axis with no extent alone', () => {
    const flat: Rect = { x: 0, y: 5, width: 10, height: 0 };
    expect(axisMaps(flat, req({ handle: 'se', dx: 10, dy: 10 })).y.k).toBe(1);
  });
});

describe('planResize', () => {
  it('rewrites a rectangle\'s box', () => {
    expect(planResize(el('<rect x="10" y="10" width="100" height="50"/>'), req({ handle: 'se', dx: 20, dy: 10 })))
      .toEqual({ ok: true, attrs: { width: '120', height: '60' } });
    expect(planResize(el('<rect x="10" y="10" width="100" height="50"/>'), req({ handle: 'w', dx: -5 })))
      .toEqual({ ok: true, attrs: { x: '5', width: '105' } });
  });

  it('scales a rectangle\'s corner radii with it', () => {
    expect(planResize(el('<rect width="100" height="50" rx="10"/>'), req({ handle: 'e', dx: 100 })))
      .toEqual({ ok: true, attrs: { width: '200', rx: '20' } });
  });

  it('rewrites an ellipse by its centre and radii', () => {
    expect(planResize(el('<ellipse cx="50" cy="50" rx="20" ry="10"/>'), req({ handle: 'e', dx: 10 })))
      .toEqual({ ok: true, attrs: { cx: '55', rx: '25' } });
  });

  it('keeps a circle round whichever handle is dragged', () => {
    expect(planResize(el('<circle cx="50" cy="50" r="10"/>'), req({ handle: 'se', dx: 10, dy: 0 })))
      .toEqual({ ok: true, attrs: { cx: '55', cy: '55', r: '15' } });
    expect(planResize(el('<circle cx="50" cy="50" r="10"/>'), req({ handle: 'e', dx: 10 })))
      .toEqual({ ok: true, attrs: { cx: '55', r: '15' } });
  });

  it('stretches a line by its end points', () => {
    expect(planResize(el('<line x1="0" y1="0" x2="10" y2="10"/>'), req({ handle: 'se', dx: 10, dy: 0 })))
      .toEqual({ ok: true, attrs: { x2: '20' } });
  });

  it('scales a path with a transform about the pinned corner', () => {
    const path = el('<path d="M10 10 H110 V60 H10 Z"/>');
    const plan = planResize(path, req({ handle: 'se', dx: 100, dy: 50, bbox: { x: 10, y: 10, width: 100, height: 50 } }));
    expect(plan).toEqual({ ok: true, attrs: { transform: 'translate(-10 -10) scale(2)' } });
  });

  it('folds into a traced path\'s translate, keeping its comma', () => {
    const path = el('<path d="M0 0 H100 V50 H0 Z" transform="translate(364,94)"/>');
    const plan = planResize(path, req({ handle: 'e', dx: 50, bbox: { x: 0, y: 0, width: 100, height: 50 } }));
    expect(plan).toEqual({ ok: true, attrs: { transform: 'translate(364,94) scale(1.5,1)' } });
  });

  it('merges a second resize into the first rather than stacking another', () => {
    const path = el('<path d="M0 0 H100 V50 H0 Z" transform="translate(5 5) scale(2)"/>');
    const plan = planResize(path, req({ handle: 'se', dx: 100, dy: 50, bbox: { x: 0, y: 0, width: 100, height: 50 } }));
    expect(plan).toEqual({ ok: true, attrs: { transform: 'translate(5 5) scale(4)' } });
  });

  it('keeps a rotation in front of the scale it adds', () => {
    const g = el('<g transform="rotate(30)"><rect width="10" height="10"/></g>');
    const plan = planResize(g, req({ handle: 'se', dx: 10, dy: 10, bbox: { x: 0, y: 0, width: 10, height: 10 } }));
    expect(plan).toEqual({ ok: true, attrs: { transform: 'rotate(30) scale(2)' } });
  });

  it('mirrors a path dragged past its opposite side', () => {
    const path = el('<path d="M0 0 H10 V10 H0 Z"/>');
    const plan = planResize(path, req({ handle: 'e', dx: -20, bbox: { x: 0, y: 0, width: 10, height: 10 } }));
    expect(plan).toEqual({ ok: true, attrs: { transform: 'scale(-1 1)' } });
  });

  it('removes the transform when a resize brings it back to nothing', () => {
    const path = el('<path d="M0 0 H10 V10 H0 Z" transform="scale(2)"/>');
    const plan = planResize(path, req({ handle: 'se', dx: -5, dy: -5, bbox: { x: 0, y: 0, width: 10, height: 10 } }));
    expect(plan).toEqual({ ok: true, attrs: { transform: null } });
  });

  it('resizes a rotated rectangle in its own frame', () => {
    const rect = el('<rect x="0" y="0" width="10" height="10" transform="rotate(45 5 5)"/>');
    expect(planResize(rect, req({ handle: 'e', dx: 10 })))
      .toEqual({ ok: true, attrs: { width: '20' } });
  });

  it('refuses an element whose transform CSS controls', () => {
    expect(planResize(el('<rect style="transform:none" width="5" height="5"/>'), req({ dx: 1 })).ok).toBe(false);
  });
});

describe('shifted', () => {
  it('keeps as many places as the value had', () => {
    expect(shifted(121.31122970581055, 5)).toBe('126.31122970581055');
    expect(shifted(0.1, 0.2)).toBe('0.3');
    expect(shifted(40, 25)).toBe('65');
  });

  it('leaves the value as written when nothing moves', () => {
    expect(shifted(1.5e-7, 0)).toBe('1.5e-7');
  });
});
