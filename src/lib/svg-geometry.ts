/**
 * Moving and resizing an element by rewriting its attributes.
 *
 * The preview shows the drawing and the source is the document, so a drag has
 * to come out as an edit to the source — and an edit a person would have made:
 * `x="40"` becomes `x="65"`, a traced path's `translate(364,94)` becomes
 * `translate(389,94)`. Nothing is re-serialized, and nothing here touches the
 * DOM's rendering APIs: the caller converts screen pixels into the element's
 * own units, and this module decides which attributes change and to what. The
 * same plan is applied to the live preview while dragging and written to the
 * source on release, so what was seen is what gets saved.
 *
 * Every function reads the SOURCE element (from a strict parse), never the
 * preview's copy, which carries the selection highlight in its style and has
 * been through the sanitizer.
 */
import { cssRulesOverriding } from './svg-dom';

/** An affine matrix in SVG's order: x' = a·x + c·y + e, y' = b·x + d·y + f. */
export interface Matrix { a: number; b: number; c: number; d: number; e: number; f: number }

export const IDENTITY: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

/** m·n — n applied first, then m. */
export function multiply(m: Matrix, n: Matrix): Matrix {
  return {
    a: m.a * n.a + m.c * n.b,
    b: m.b * n.a + m.d * n.b,
    c: m.a * n.c + m.c * n.d,
    d: m.b * n.c + m.d * n.d,
    e: m.a * n.e + m.c * n.f + m.e,
    f: m.b * n.e + m.d * n.f + m.f,
  };
}

export function invert(m: Matrix): Matrix | null {
  const det = m.a * m.d - m.b * m.c;
  if (!det || !Number.isFinite(det)) return null;
  return {
    a: m.d / det,
    b: -m.b / det,
    c: -m.c / det,
    d: m.a / det,
    e: (m.c * m.f - m.d * m.e) / det,
    f: (m.b * m.e - m.a * m.f) / det,
  };
}

export function applyToPoint(m: Matrix, x: number, y: number): { x: number; y: number } {
  return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f };
}

/** A displacement through the matrix: the linear part only, no translation. */
export function applyToVector(m: Matrix, x: number, y: number): { x: number; y: number } {
  return { x: m.a * x + m.c * y, y: m.b * x + m.d * y };
}

/** Screen pixels per user unit under a matrix, for picking how finely to round. */
export function pixelsPerUnit(m: Matrix): number {
  return Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));
}

/**
 * Decimal places worth writing when one screen pixel spans `1 / pxPerUnit`
 * units: whole numbers at 1:1, one place at 10×, none for a zoomed-out poster.
 * Writing more records the jitter of a hand on a mouse, not an intention.
 */
export function decimalsFor(pxPerUnit: number): number {
  if (!(pxPerUnit > 0) || !Number.isFinite(pxPerUnit)) return 0;
  return Math.min(4, Math.max(0, Math.ceil(Math.log10(pxPerUnit) - 0.05)));
}

export function roundTo(n: number, decimals: number): number {
  const r = Number(n.toFixed(decimals));
  return Object.is(r, -0) ? 0 : r;
}

/** A number as an attribute value: no float noise, no trailing zeros, no "-0". */
export function fmt(n: number, decimals = 6): string {
  return String(roundTo(n, decimals));
}

/** Decimal places a number was written with. */
function placesOf(n: number): number {
  const m = /\.(\d+)(?:e([-+]\d+))?$/i.exec(String(n));
  return m ? Math.max(0, m[1].length - Number(m[2] ?? 0)) : 0;
}

/**
 * `value + delta`, written as finely as the value was. A move should change a
 * coordinate by the distance moved and nothing else: a traced path's
 * `translate(121.31122970581055,…)` keeps its digits rather than being rounded
 * to six places by a drag that only shifted it by 5.
 */
export function shifted(value: number, delta: number): string {
  if (delta === 0) return String(value);
  return fmt(value + delta, Math.min(15, Math.max(6, placesOf(value))));
}

// ---------------------------------------------------------------------------
// The transform attribute
// ---------------------------------------------------------------------------

export interface TransformFn {
  name: 'matrix' | 'translate' | 'scale' | 'rotate' | 'skewX' | 'skewY';
  args: number[];
  /** Where this function sits in the attribute value, so one can be replaced
   * without rewriting the others. */
  start: number;
  end: number;
}

const ARG_COUNTS: Record<TransformFn['name'], number[]> = {
  matrix: [6], translate: [1, 2], scale: [1, 2], rotate: [1, 3], skewX: [1], skewY: [1],
};

/** The functions in a transform attribute, or null when it does not parse — an
 * attribute this cannot read is one it must not rewrite. */
export function parseTransform(value: string): TransformFn[] | null {
  const out: TransformFn[] = [];
  const re = /\s*(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)\s*,?/y;
  let i = 0;
  while (i < value.length) {
    if (/^\s*$/.test(value.slice(i))) break;
    re.lastIndex = i;
    const m = re.exec(value);
    if (!m) return null;
    const name = m[1] as TransformFn['name'];
    const raw = m[2].trim();
    const args = raw === '' ? [] : raw.split(/\s*,\s*|\s+/).map(Number);
    if (args.some((n) => !Number.isFinite(n)) || !ARG_COUNTS[name].includes(args.length)) return null;
    const start = m.index + m[0].indexOf(m[1]);
    out.push({ name, args, start, end: value.indexOf(')', start) + 1 });
    i = re.lastIndex;
  }
  return out;
}

export function fnMatrix(fn: TransformFn): Matrix {
  const [p = 0, q, r] = fn.args;
  switch (fn.name) {
    case 'matrix': {
      const [a, b, c, d, e, f] = fn.args;
      return { a, b, c, d, e, f };
    }
    case 'translate': return { ...IDENTITY, e: p, f: q ?? 0 };
    case 'scale': return { ...IDENTITY, a: p, d: q ?? p };
    case 'rotate': {
      const rad = (p * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rot = { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 };
      if (q === undefined) return rot;
      const cx = q;
      const cy = r ?? 0;
      return multiply(multiply({ ...IDENTITY, e: cx, f: cy }, rot), { ...IDENTITY, e: -cx, f: -cy });
    }
    case 'skewX': return { ...IDENTITY, c: Math.tan((p * Math.PI) / 180) };
    case 'skewY': return { ...IDENTITY, b: Math.tan((p * Math.PI) / 180) };
  }
}

export function listMatrix(list: TransformFn[]): Matrix {
  return list.reduce((m, fn) => multiply(m, fnMatrix(fn)), IDENTITY);
}

/** Arguments joined the way the original function joined them, so a rewrite
 * of `translate(364,94)` stays comma-separated. */
function joinArgs(original: string, args: string[]): string {
  return args.join(original.includes(',') ? ',' : ' ');
}

// ---------------------------------------------------------------------------
// Planning
// ---------------------------------------------------------------------------

export type EditPlan =
  | { ok: true; attrs: Record<string, string | null> }
  | { ok: false; reason: string };

const NUMBER = /^\s*[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?\s*(?:px)?\s*$/i;
const NUMBER_LIST = /^\s*[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?(?:(?:\s*,\s*|\s+)[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)*\s*$/i;

const CSS_POSITIONED = 'This element is positioned by CSS, so it cannot be moved or resized here. Change its style in the code instead.';
const ANIMATED = 'This element is animated, so it cannot be moved or resized here.';
const NESTED_SVG = 'A nested <svg> cannot be resized here. Change its width and height in the code instead.';
const UNREADABLE_TRANSFORM = 'This element\'s transform could not be read, so it cannot be moved or resized here.';

/** Does CSS — the element's own style, or a rule in the document — set this property? */
function cssSets(el: Element, property: string): boolean {
  const style = el.getAttribute('style');
  if (style && new RegExp(`(^|;)\\s*${property}\\s*:`, 'i').test(style)) return true;
  return el.ownerDocument ? cssRulesOverriding(el.ownerDocument, [el], property).length > 0 : false;
}

/**
 * Why this element cannot be edited at all, or null. A CSS transform replaces
 * the attribute outright, and transform-origin changes what the attribute
 * means; either way an edit would not land where the user put it. Animation
 * would take the attribute back on its next frame.
 */
function blockedReason(el: Element): string | null {
  if (['transform', 'transform-origin', 'transform-box'].some((p) => cssSets(el, p))) return CSS_POSITIONED;
  // The same property as an attribute: it moves the point a scale grows
  // from, so a resize would leap away from the pointer.
  if (el.hasAttribute('transform-origin') || el.hasAttribute('transform-box')) return CSS_POSITIONED;
  if (Array.from(el.children).some((c) => /^(animate|animatetransform|animatemotion|set)$/i.test(c.tagName))) return ANIMATED;
  return null;
}

function readTransform(el: Element): TransformFn[] | null {
  const value = el.getAttribute('transform');
  return value === null ? [] : parseTransform(value);
}

/** Attribute values that can be shifted or scaled as plain numbers, or null. */
function plainNumbers(el: Element, names: string[], { lists = false, required = [] as string[] } = {}): Record<string, number[]> | null {
  const out: Record<string, number[]> = {};
  for (const name of names) {
    const raw = el.getAttribute(name);
    if (raw === null) {
      if (required.includes(name)) return null;
      out[name] = [0];
      continue;
    }
    if (cssSets(el, name)) return null;
    if (NUMBER.test(raw)) { out[name] = [parseFloat(raw)]; continue; }
    if (lists && NUMBER_LIST.test(raw)) { out[name] = raw.trim().split(/\s*,\s*|\s+/).map(Number); continue; }
    return null;
  }
  return out;
}

const shiftedList = (values: number[], delta: number) => values.map((v) => shifted(v, delta)).join(' ');

/** Which attributes carry an element's position along each axis. */
const MOVE_ATTRS: Record<string, { x: string[]; y: string[] }> = {
  rect: { x: ['x'], y: ['y'] },
  image: { x: ['x'], y: ['y'] },
  use: { x: ['x'], y: ['y'] },
  svg: { x: ['x'], y: ['y'] },
  foreignobject: { x: ['x'], y: ['y'] },
  text: { x: ['x'], y: ['y'] },
  circle: { x: ['cx'], y: ['cy'] },
  ellipse: { x: ['cx'], y: ['cy'] },
  line: { x: ['x1', 'x2'], y: ['y1', 'y2'] },
};

/**
 * Move an element by (dx, dy), measured in its PARENT's user units — the space
 * its transform attribute maps into.
 *
 * In order of preference:
 *   1. a leading `translate(...)` or `matrix(...)` is where the author put the
 *      position, so that is what changes (every traced path has one);
 *   2. an element with its own position attributes gets those shifted — in its
 *      local units, which is the parent's delta taken back through whatever
 *      rotation or scale its transform applies;
 *   3. anything else — a path, a polygon, a group — gets a `translate` in front.
 */
export function planMove(el: Element, dx: number, dy: number): EditPlan {
  const blocked = blockedReason(el);
  if (blocked) return { ok: false, reason: blocked };
  const list = readTransform(el);
  if (!list) return { ok: false, reason: UNREADABLE_TRANSFORM };
  if (dx === 0 && dy === 0) return { ok: true, attrs: {} };
  const value = el.getAttribute('transform') ?? '';
  const first = list[0];

  if (first?.name === 'translate') {
    const text = value.slice(first.start, first.end);
    const [tx, ty = 0] = first.args;
    const args = first.args.length === 1 && dy === 0 ? [shifted(tx, dx)] : [shifted(tx, dx), shifted(ty, dy)];
    return { ok: true, attrs: { transform: value.slice(0, first.start) + `translate(${joinArgs(text, args)})` + value.slice(first.end) } };
  }
  if (first?.name === 'matrix') {
    const text = value.slice(first.start, first.end);
    const [a, b, c, d, e, f] = first.args;
    const args = [String(a), String(b), String(c), String(d), shifted(e, dx), shifted(f, dy)];
    return { ok: true, attrs: { transform: value.slice(0, first.start) + `matrix(${joinArgs(text, args)})` + value.slice(first.end) } };
  }

  const tag = el.tagName.toLowerCase();
  const spec = MOVE_ATTRS[tag];
  // A <text> whose runs place themselves would leave them behind.
  const runsPlaceThemselves = tag === 'text' && el.querySelector('[x], [y]') !== null;
  const values = spec && !runsPlaceThemselves
    ? plainNumbers(el, [...spec.x, ...spec.y], { lists: tag === 'text' })
    : null;
  const inverse = invert(listMatrix(list));
  if (spec && values && inverse) {
    const local = applyToVector(inverse, dx, dy);
    const attrs: Record<string, string | null> = {};
    for (const [names, delta] of [[spec.x, local.x], [spec.y, local.y]] as const) {
      if (roundTo(delta, 6) === 0) continue;
      for (const name of names) attrs[name] = shiftedList(values[name], delta);
    }
    return { ok: true, attrs };
  }

  const translate = `translate(${fmt(dx)} ${fmt(dy)})`;
  return { ok: true, attrs: { transform: value.trim() ? `${translate} ${value.trim()}` : translate } };
}

export type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface Rect { x: number; y: number; width: number; height: number }

export interface ResizeRequest {
  handle: Handle;
  /** How far the handle was dragged, in the element's LOCAL units (before its
   * own transform). Already rounded to what the zoom level can express. */
  dx: number;
  dy: number;
  keepAspect: boolean;
  /** The element's local bounding box, as the renderer measures it. Used for
   * shapes whose geometry this module does not read itself. */
  bbox: Rect;
  /** Smallest extent a side may be dragged to, in local units. */
  minSize: number;
  /** Decimal places for the translation written into a transform. */
  decimals: number;
}

/** One axis of a resize: x' = anchor + (x − anchor) · k. */
interface AxisMap { anchor: number; k: number }

/**
 * Where each axis is pinned and how far it stretches, for a handle dragged by
 * (dx, dy). The side opposite the handle stays put; a side handle leaves the
 * other axis alone unless the aspect ratio is locked, in which case it grows
 * about its middle. Dragging past the opposite side makes k negative — a flip,
 * which a transform shows as a mirror image and a rectangle simply absorbs.
 */
export function axisMaps(box: Rect, req: Pick<ResizeRequest, 'handle' | 'dx' | 'dy' | 'keepAspect' | 'minSize'>): { x: AxisMap; y: AxisMap } {
  const { handle } = req;
  const axis = (start: number, size: number, low: boolean, high: boolean, delta: number): AxisMap & { driven: boolean } => {
    if (size <= 0) return { anchor: start, k: 1, driven: false };
    if (high) return { anchor: start, k: (size + delta) / size, driven: true };
    if (low) return { anchor: start + size, k: (size - delta) / size, driven: true };
    return { anchor: start + size / 2, k: 1, driven: false };
  };
  const x = axis(box.x, box.width, handle.includes('w'), handle.includes('e'), req.dx);
  const y = axis(box.y, box.height, handle.includes('n'), handle.includes('s'), req.dy);

  if (req.keepAspect && box.width > 0 && box.height > 0) {
    if (x.driven && y.driven) {
      const s = Math.max(Math.abs(x.k), Math.abs(y.k));
      x.k = Math.sign(x.k || 1) * s;
      y.k = Math.sign(y.k || 1) * s;
    } else if (x.driven) {
      y.k = Math.abs(x.k);
    } else if (y.driven) {
      x.k = Math.abs(y.k);
    }
  }
  const floor = (a: AxisMap, size: number) => {
    if (size > 0 && Math.abs(a.k) * size < req.minSize) a.k = Math.sign(a.k || 1) * (req.minSize / size);
  };
  floor(x, box.width);
  floor(y, box.height);
  return { x: { anchor: x.anchor, k: x.k }, y: { anchor: y.anchor, k: y.k } };
}

const mapAxis = (m: AxisMap, v: number) => m.anchor + (v - m.anchor) * m.k;

/** The box after a resize, normalized so width and height are never negative. */
export function resizedBox(box: Rect, maps: { x: AxisMap; y: AxisMap }): Rect {
  const x1 = mapAxis(maps.x, box.x);
  const x2 = mapAxis(maps.x, box.x + box.width);
  const y1 = mapAxis(maps.y, box.y);
  const y2 = mapAxis(maps.y, box.y + box.height);
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) };
}

/** The box a shape's own attributes describe, when this module can read them. */
function nativeBox(el: Element): { box: Rect; values: Record<string, number[]> } | null {
  const tag = el.tagName.toLowerCase();
  if (tag === 'rect' || tag === 'image' || tag === 'foreignobject') {
    const v = plainNumbers(el, ['x', 'y', 'width', 'height'], { required: ['width', 'height'] });
    if (!v) return null;
    if (tag === 'rect') {
      for (const r of ['rx', 'ry']) {
        if (el.getAttribute(r) === null) continue;
        const rv = plainNumbers(el, [r]);
        if (!rv) return null;
        v[r] = rv[r];
      }
    }
    return { box: { x: v.x[0], y: v.y[0], width: v.width[0], height: v.height[0] }, values: v };
  }
  if (tag === 'ellipse') {
    const v = plainNumbers(el, ['cx', 'cy', 'rx', 'ry'], { required: ['rx', 'ry'] });
    if (!v) return null;
    return { box: { x: v.cx[0] - v.rx[0], y: v.cy[0] - v.ry[0], width: 2 * v.rx[0], height: 2 * v.ry[0] }, values: v };
  }
  if (tag === 'circle') {
    const v = plainNumbers(el, ['cx', 'cy', 'r'], { required: ['r'] });
    if (!v) return null;
    return { box: { x: v.cx[0] - v.r[0], y: v.cy[0] - v.r[0], width: 2 * v.r[0], height: 2 * v.r[0] }, values: v };
  }
  if (tag === 'line') {
    const v = plainNumbers(el, ['x1', 'y1', 'x2', 'y2']);
    if (!v) return null;
    const [x1, y1, x2, y2] = [v.x1[0], v.y1[0], v.x2[0], v.y2[0]];
    return { box: { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) }, values: v };
  }
  return null;
}

/**
 * Resize an element by dragging one of its eight handles.
 *
 * Shapes defined by a box — rect, image, ellipse, circle, line — get their own
 * attributes rewritten. Everything else (paths, polygons, text, groups) is
 * scaled by its transform: the scale-and-shift is folded into a trailing
 * `translate(…) scale(…)` so repeated resizes keep one pair rather than
 * stacking a new one each time. A stroke scales along with the shape it
 * belongs to, as it would in any drawing program that scales objects.
 */
export function planResize(el: Element, req: ResizeRequest): EditPlan {
  const blocked = blockedReason(el);
  if (blocked) return { ok: false, reason: blocked };
  const list = readTransform(el);
  if (!list) return { ok: false, reason: UNREADABLE_TRANSFORM };
  const tag = el.tagName.toLowerCase();
  // Its width and height are in its parent's units but what it draws is in
  // its viewBox's, so neither the handles nor a scale would track the pointer.
  if (tag === 'svg') return { ok: false, reason: NESTED_SVG };

  const native = nativeBox(el);
  if (native) {
    const maps = axisMaps(native.box, { ...req, keepAspect: req.keepAspect || tag === 'circle' });
    const next = resizedBox(native.box, maps);
    const v = native.values;
    const attrs: Record<string, string | null> = {};
    const set = (name: string, value: number) => {
      if (roundTo(value, 6) !== roundTo(v[name][0], 6)) attrs[name] = fmt(value);
    };
    if (tag === 'ellipse' || tag === 'circle') {
      set('cx', next.x + next.width / 2);
      set('cy', next.y + next.height / 2);
      if (tag === 'circle') set('r', next.width / 2);
      else { set('rx', next.width / 2); set('ry', next.height / 2); }
    } else if (tag === 'line') {
      set('x1', mapAxis(maps.x, v.x1[0]));
      set('y1', mapAxis(maps.y, v.y1[0]));
      set('x2', mapAxis(maps.x, v.x2[0]));
      set('y2', mapAxis(maps.y, v.y2[0]));
    } else {
      set('x', next.x);
      set('y', next.y);
      set('width', next.width);
      set('height', next.height);
      if (v.rx) set('rx', v.rx[0] * Math.abs(maps.x.k));
      if (v.ry) set('ry', v.ry[0] * Math.abs(maps.y.k));
    }
    return { ok: true, attrs };
  }

  const maps = axisMaps(req.bbox, req);
  const local: Matrix = {
    a: maps.x.k, b: 0, c: 0, d: maps.y.k,
    e: maps.x.anchor * (1 - maps.x.k),
    f: maps.y.anchor * (1 - maps.y.k),
  };

  // Fold into the run of translate/scale at the end of the list, which is
  // what an earlier resize left there. A matrix can absorb anything, but
  // nobody wants to read one where two plain functions would do.
  let runStart = list.length;
  while (runStart > 0 && (list[runStart - 1].name === 'translate' || list[runStart - 1].name === 'scale')) runStart -= 1;
  const before = listMatrix(list.slice(runStart));
  const run = multiply(before, local);
  const value = el.getAttribute('transform') ?? '';
  const prefix = runStart === 0 ? '' : value.slice(0, list[runStart - 1].end).trim();
  const comma = runStart < list.length && value.slice(list[runStart].start).includes(',');

  const sep = comma ? ',' : ' ';
  // What the drag changed is rounded; what it did not stays as written. The
  // offset moves by an amount rounded to what the zoom can show, keeping the
  // digits it had — a traced path's translate(121.31122970581055,…) is not cut
  // to 121.3. The scale is rounded to significant digits, so a glyph's
  // scale(0.00048828125) is not cut to 0.00049, a 0.35% jump at the first pixel.
  const offset = (was: number, now: number) => shifted(was, roundTo(now - was, req.decimals + 1));
  const e = offset(before.e, run.e);
  const f = offset(before.f, run.f);
  const sx = maps.x.k === 1 ? before.a : Number(run.a.toPrecision(6));
  const sy = maps.y.k === 1 ? before.d : Number(run.d.toPrecision(6));
  const num = (n: number) => String(Object.is(n, -0) ? 0 : n);
  const parts: string[] = [];
  if (Number(e) !== 0 || Number(f) !== 0) parts.push(`translate(${e}${sep}${f})`);
  if (sx !== 1 || sy !== 1) parts.push(sx === sy ? `scale(${num(sx)})` : `scale(${num(sx)}${sep}${num(sy)})`);
  const next = [prefix, ...parts].filter(Boolean).join(' ');
  if (next === value.trim()) return { ok: true, attrs: {} };
  return { ok: true, attrs: { transform: next || null } };
}
