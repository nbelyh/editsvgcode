import {
  validateSvg, resolveSelector, isSelectorError, describeNoMatch, elementExtents, pathOf, lineOfOffset,
  type TextEditOutcome, type TextEditRange,
} from './svg-dom';

/**
 * The separate shapes inside one <path>, and splitting the path into them.
 *
 * A traced drawing packs many parts of the picture into one path — a trunk, a canopy and a
 * figure can all be one d="…", holes included. "Colour the trunk" then had nothing to address,
 * and the model recoloured whole paths, painting everything that shared them. Splitting a path
 * at its subpaths gives each part its own element.
 *
 * A split must not change a single pixel, so parts are never cut apart where drawing them
 * separately could render differently. A hole stays with the outline it is cut into — found by
 * box containment, so a shape sitting in a concave outline's box stays with it too, which only
 * costs separability. Two outlines whose boxes overlap stay together whenever the overlap could
 * render differently apart: under evenodd, with opposite windings, stroked, or translucent.
 * Where the styling is not known — a class a <style> rule may style — the cautious answer is
 * assumed. Shapes whose boxes are apart are always safe to separate, and that is the common
 * case the split exists for: the parts of a traced picture sit side by side.
 */

interface Box { minX: number; minY: number; maxX: number; maxY: number }

interface Subpath {
  /** Its own path data, starting with an absolute moveto. */
  text: string;
  box: Box;
  /** Signed area of `poly`; the sign is its winding. */
  area: number;
  /** The outline flattened to points, arcs and curves sampled. */
  poly: Array<[number, number]>;
}

/** One separable part: an outline, the holes cut into it, and anything else that must stay with it. */
export interface PathPart {
  d: string;
  box: Box;
  subpaths: number;
}

/** What rendering the path's parts apart could disturb, read off the element and its ancestors. */
export interface SplitRisk {
  evenOdd: boolean;
  stroked: boolean;
  translucent: boolean;
  /** The stroke's width in the path's units, when it is known; a stroked path without one is
   *  measured generously. */
  strokeWidth?: number;
}

const COMMAND = /[MmLlHhVvCcSsQqTtAaZz]/;
const NUMBER = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y;
const ARC_SAMPLES = 16;
const CURVE_SAMPLES = 8;

function emptyBox(): Box {
  return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
}

function grow(box: Box, x: number, y: number): void {
  if (x < box.minX) box.minX = x;
  if (x > box.maxX) box.maxX = x;
  if (y < box.minY) box.minY = y;
  if (y > box.maxY) box.maxY = y;
}

function union(a: Box, b: Box): Box {
  return { minX: Math.min(a.minX, b.minX), minY: Math.min(a.minY, b.minY), maxX: Math.max(a.maxX, b.maxX), maxY: Math.max(a.maxY, b.maxY) };
}

function boxArea(b: Box): number {
  return Math.max(0, b.maxX - b.minX) * Math.max(0, b.maxY - b.minY);
}

/** Does `inner` lie within `outer`, allowing for the rounding in sampled curve bounds? */
function within(inner: Box, outer: Box): boolean {
  const slack = 0.01 * Math.max(outer.maxX - outer.minX, outer.maxY - outer.minY, 1e-9);
  return inner.minX >= outer.minX - slack && inner.maxX <= outer.maxX + slack
    && inner.minY >= outer.minY - slack && inner.maxY <= outer.maxY + slack;
}

function overlaps(a: Box, b: Box): boolean {
  return a.minX < b.maxX && b.minX < a.maxX && a.minY < b.maxY && b.minY < a.maxY;
}

/** Rounded so relative coordinates summed into absolute ones do not print as 12.000000000000002. */
function fmt(n: number): string {
  return String(Number(n.toFixed(6)));
}

/** Points along an elliptical arc, for its bounds (SVG implementation notes, F.6.5). */
function arcPoints(x1: number, y1: number, rx: number, ry: number, angle: number, large: number, sweep: number, x2: number, y2: number): Array<[number, number]> {
  rx = Math.abs(rx); ry = Math.abs(ry);
  if (rx === 0 || ry === 0 || (x1 === x2 && y1 === y2)) return [[x2, y2]];
  const phi = (angle * Math.PI) / 180, cos = Math.cos(phi), sin = Math.sin(phi);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const xp = cos * dx + sin * dy, yp = -sin * dx + cos * dy;
  const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
  if (lambda > 1) { rx *= Math.sqrt(lambda); ry *= Math.sqrt(lambda); }
  const num = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp;
  const den = rx * rx * yp * yp + ry * ry * xp * xp;
  const coef = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (coef * rx * yp) / ry, cyp = (-coef * ry * xp) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2, cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const ang = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t1 = ang(1, 0, (xp - cxp) / rx, (yp - cyp) / ry);
  let dt = ang((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry);
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  const points: Array<[number, number]> = [];
  for (let k = 1; k <= ARC_SAMPLES; k++) {
    const t = t1 + (dt * k) / ARC_SAMPLES;
    const ex = rx * Math.cos(t), ey = ry * Math.sin(t);
    points.push([cos * ex - sin * ey + cx, sin * ex + cos * ey + cy]);
  }
  return points;
}

/** Points along a cubic (or a quadratic given as one), for its bounds. */
function curvePoints(x0: number, y0: number, c1x: number, c1y: number, c2x: number, c2y: number, x3: number, y3: number): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  for (let k = 1; k <= CURVE_SAMPLES; k++) {
    const t = k / CURVE_SAMPLES, u = 1 - t;
    points.push([
      u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x3,
      u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y3,
    ]);
  }
  return points;
}

/**
 * Cut path data into subpaths, each rewritten to start with an absolute moveto so it draws the
 * same on its own. Everything after that moveto is kept byte for byte: a relative command
 * only needs the current point, and the moveto restores it.
 */
export function subpathsOf(d: string): Subpath[] | { error: string } {
  const n = d.length;
  let i = 0;
  const skip = () => { while (i < n && (d[i] === ' ' || d[i] === ',' || d[i] === '\n' || d[i] === '\r' || d[i] === '\t')) i++; };
  const nextIsNumber = () => { skip(); return i < n && /[\d.+-]/.test(d[i]); };
  const num = (): number => {
    skip();
    NUMBER.lastIndex = i;
    const m = NUMBER.exec(d);
    if (!m) throw new Error(`expected a number at character ${i}`);
    i = NUMBER.lastIndex;
    return parseFloat(m[0]);
  };
  const flag = (): number => {
    skip();
    if (d[i] === '0' || d[i] === '1') return +d[i++];
    throw new Error(`expected an arc flag at character ${i}`);
  };

  interface Open { offset: number; head: string; headEnd: number; box: Box; poly: Array<[number, number]> }
  const open: Open[] = [];
  let x = 0, y = 0, sx = 0, sy = 0;
  // The last control point, for S and T, which reflect it.
  let cpx = 0, cpy = 0, last = '';
  let cur: Open | null = null;
  // Every point reached counts toward both the box and the winding — sampled arcs and curves
  // included, or a circle drawn as two arcs would have no area at all.
  const reach = (px: number, py: number) => { if (cur) { grow(cur.box, px, py); cur.poly.push([px, py]); } };

  try {
    skip();
    while (i < n) {
      skip();
      if (i >= n) break;
      const at = i;
      if (!COMMAND.test(d[i])) throw new Error(`expected a command at character ${i}`);
      const letter = d[i++];
      const rel = letter === letter.toLowerCase();
      const op = letter.toLowerCase();

      if (op === 'm') {
        const mx = num(), my = num();
        x = rel ? x + mx : mx; y = rel ? y + my : my;
        sx = x; sy = y;
        const headEnd = i;
        // A relative moveto followed by more pairs continues as relative lineto; written as an
        // absolute M, those pairs would turn absolute unless the l is spelled out.
        const head = rel ? `M${fmt(x)} ${fmt(y)}${nextIsNumber() ? ' l' : ''}` : '';
        cur = { offset: at, head, headEnd, box: emptyBox(), poly: [[x, y]] };
        open.push(cur);
        grow(cur.box, x, y);
        while (nextIsNumber()) {
          const lx = num(), ly = num();
          x = rel ? x + lx : lx; y = rel ? y + ly : ly;
          reach(x, y);
        }
        last = 'm';
        continue;
      }
      if (!cur) throw new Error('path data does not start with a moveto');

      if (op === 'z') {
        x = sx; y = sy;
        last = 'z';
        continue;
      }

      do {
        const x0 = x, y0 = y;
        if (op === 'l' || op === 't') {
          const ex = num(), ey = num();
          const nx = rel ? x + ex : ex, ny = rel ? y + ey : ey;
          if (op === 't') {
            const qx = last === 'q' || last === 't' ? 2 * x - cpx : x, qy = last === 'q' || last === 't' ? 2 * y - cpy : y;
            for (const p of curvePoints(x0, y0, x0 + (2 / 3) * (qx - x0), y0 + (2 / 3) * (qy - y0), nx + (2 / 3) * (qx - nx), ny + (2 / 3) * (qy - ny), nx, ny)) reach(...p);
            cpx = qx; cpy = qy;
          }
          x = nx; y = ny;
        } else if (op === 'h') {
          const v = num(); x = rel ? x + v : v;
        } else if (op === 'v') {
          const v = num(); y = rel ? y + v : v;
        } else if (op === 'c') {
          const a = [num(), num(), num(), num(), num(), num()];
          const [c1x, c1y, c2x, c2y, ex, ey] = rel ? a.map((v, k) => v + (k % 2 ? y : x)) : a;
          for (const p of curvePoints(x0, y0, c1x, c1y, c2x, c2y, ex, ey)) reach(...p);
          cpx = c2x; cpy = c2y; x = ex; y = ey;
        } else if (op === 's') {
          const a = [num(), num(), num(), num()];
          const [c2x, c2y, ex, ey] = rel ? a.map((v, k) => v + (k % 2 ? y : x)) : a;
          const c1x = last === 'c' || last === 's' ? 2 * x - cpx : x, c1y = last === 'c' || last === 's' ? 2 * y - cpy : y;
          for (const p of curvePoints(x0, y0, c1x, c1y, c2x, c2y, ex, ey)) reach(...p);
          cpx = c2x; cpy = c2y; x = ex; y = ey;
        } else if (op === 'q') {
          const a = [num(), num(), num(), num()];
          const [qx, qy, ex, ey] = rel ? a.map((v, k) => v + (k % 2 ? y : x)) : a;
          for (const p of curvePoints(x0, y0, x0 + (2 / 3) * (qx - x0), y0 + (2 / 3) * (qy - y0), ex + (2 / 3) * (qx - ex), ey + (2 / 3) * (qy - ey), ex, ey)) reach(...p);
          cpx = qx; cpy = qy; x = ex; y = ey;
        } else if (op === 'a') {
          const rx = num(), ry = num(), rot = num(), large = flag(), sweep = flag(), ex = num(), ey = num();
          const nx = rel ? x + ex : ex, ny = rel ? y + ey : ey;
          for (const p of arcPoints(x0, y0, rx, ry, rot, large, sweep, nx, ny)) reach(...p);
          x = nx; y = ny;
        }
        reach(x, y);
        last = op;
      } while (nextIsNumber());
    }
  } catch (e) {
    return { error: (e as Error).message };
  }

  return open.map((s, k) => {
    const end = k + 1 < open.length ? open[k + 1].offset : n;
    const body = s.head ? `${s.head}${d.slice(s.headEnd, end)}` : d.slice(s.offset, end);
    let area = 0;
    for (let p = 0; p < s.poly.length; p++) {
      const [ax, ay] = s.poly[p], [bx, by] = s.poly[(p + 1) % s.poly.length];
      area += ax * by - bx * ay;
    }
    return { text: body.trim(), box: s.box, area: area / 2, poly: s.poly };
  });
}

/**
 * Group subpaths into the parts that can be drawn apart without changing the picture, in the
 * order their first subpath appears.
 */
export function pathParts(d: string, risk: SplitRisk): PathPart[] | { error: string } {
  const subs = subpathsOf(d);
  if ('error' in subs) return subs;
  const count = subs.length;
  if (count === 0) return [];
  // The smallest subpath whose box holds each one: the outline it is cut into, or sits inside.
  const parent = subs.map((s, k) => {
    let best = -1;
    for (let j = 0; j < count; j++) {
      if (j === k || boxArea(subs[j].box) <= boxArea(s.box) || !within(s.box, subs[j].box)) continue;
      if (best < 0 || boxArea(subs[j].box) < boxArea(subs[best].box)) best = j;
    }
    return best;
  });
  const owner = subs.map((_, k) => k);
  const find = (k: number): number => (owner[k] === k ? k : (owner[k] = find(owner[k])));
  const join = (a: number, b: number) => { owner[find(a)] = find(b); };

  const cautious = risk.evenOdd || risk.stroked || risk.translucent;
  // Whether each subpath fills or cuts, decided from its container down — larger boxes first, so
  // a container is always decided before what it holds.
  const hole = subs.map(() => false);
  const byArea = subs.map((_, k) => k).sort((a, b) => boxArea(subs[b].box) - boxArea(subs[a].box));
  for (const k of byArea) {
    const p = parent[k];
    if (p < 0) continue;
    const turnsBack = Math.sign(subs[p].area) !== Math.sign(subs[k].area);
    // Inside a filled shape, winding the other way cuts a hole; inside a hole, it fills again.
    hole[k] = hole[p] ? !turnsBack : turnsBack;
    // An island is a filled shape standing in a hole. Drawn apart it fills exactly where it
    // filled before. Boxes can misjudge the depth, though, and a misjudged island overlaps the
    // outline's fill — harmless only when opaque, unstroked and nonzero, so anywhere else it
    // stays put. Everything else stays with what it sits in: a hole with the shape it cuts,
    // however deep, and a shape with the one it lies on.
    const island = hole[p] && !hole[k] && !cautious;
    if (!island) join(k, p);
  }
  // Outlines whose boxes partly overlap stay together where drawing them apart could show; a
  // stroke reaches past the outline by half its width, so a stroked part is measured with it.
  // Nested ones were settled above.
  const whole = subs.map((s) => s.box).reduce(union);
  const reachOf = risk.stroked
    ? (risk.strokeWidth ?? 0.05 * Math.max(whole.maxX - whole.minX, whole.maxY - whole.minY))
    : 0;
  const widened = subs.map((s) => ({ minX: s.box.minX - reachOf, minY: s.box.minY - reachOf, maxX: s.box.maxX + reachOf, maxY: s.box.maxY + reachOf }));
  for (let a = 0; a < count; a++) {
    for (let b = a + 1; b < count; b++) {
      if (find(a) === find(b) || !overlaps(widened[a], subs[b].box)) continue;
      if (within(subs[a].box, subs[b].box) || within(subs[b].box, subs[a].box)) continue;
      if (cautious || Math.sign(subs[a].area) !== Math.sign(subs[b].area)) join(a, b);
    }
  }

  const parts = new Map<number, number[]>();
  for (let k = 0; k < count; k++) {
    const root = find(k);
    if (!parts.has(root)) parts.set(root, []);
    parts.get(root)!.push(k);
  }
  return [...parts.values()]
    .sort((a, b) => a[0] - b[0])
    .map((members) => ({
      d: members.map((k) => subs[k].text).join(' '),
      box: members.map((k) => subs[k].box).reduce(union),
      subpaths: members.length,
    }));
}

/** Parse a style attribute into [property, value] pairs, keeping their order. */
function declarations(style: string): Array<[string, string]> {
  return style.split(';').map((decl) => decl.split(':')).filter((kv) => kv.length >= 2)
    .map(([k, ...v]) => [k.trim().toLowerCase(), v.join(':').trim()] as [string, string]).filter(([k]) => k);
}

/** A property as the element or one of its ancestors sets it inline, nearest first. */
function inherited(el: Element, property: string): string | undefined {
  for (let node: Element | null = el; node; node = node.parentElement) {
    const decl = declarations(node.getAttribute('style') ?? '').find(([k]) => k === property);
    if (decl) return decl[1];
    const attr = node.getAttribute(property);
    if (attr !== null) return attr;
  }
  return undefined;
}

/** What drawing this path's parts apart could disturb. */
export function splitRiskOf(el: Element, doc: Document): SplitRisk {
  // A <style> rule may set any of these through a selector this does not evaluate, so a
  // document that has one gets the cautious answer throughout.
  const styledByRule = doc.getElementsByTagName('style').length > 0;
  const stroke = inherited(el, 'stroke');
  // Opacity is not inherited, but the element's own composites fill and overlap as one; apart,
  // each part would be faded separately and their overlap would show darker.
  const ownOpacity = declarations(el.getAttribute('style') ?? '').find(([k]) => k === 'opacity')?.[1] ?? el.getAttribute('opacity') ?? undefined;
  const fadedByOpacity = [ownOpacity, inherited(el, 'fill-opacity')].some((v) => v !== undefined && !(parseFloat(v) >= 1));
  let fill = (inherited(el, 'fill') ?? '').trim().toLowerCase();
  if (fill === 'currentcolor') fill = (inherited(el, 'color') ?? '').trim().toLowerCase();
  const width = parseFloat(inherited(el, 'stroke-width') ?? '1');
  return {
    evenOdd: styledByRule || inherited(el, 'fill-rule') === 'evenodd',
    stroked: styledByRule || (stroke !== undefined && stroke !== 'none'),
    translucent: styledByRule || fadedByOpacity || seeThrough(fill),
    // Only a plain number is in the path's units; a unit, a percentage or a rule leaves it unknown.
    strokeWidth: !styledByRule && /^\s*[\d.]+\s*$/.test(inherited(el, 'stroke-width') ?? '1') && width >= 0 ? width : undefined,
  };
}

/** Does this colour carry an alpha below one? Unsure counts as yes. */
function seeThrough(color: string): boolean {
  if (!color || color === 'none') return false;
  if (color === 'transparent') return true;
  if (/^#(?:[0-9a-f]{4}|[0-9a-f]{8})$/.test(color)) {
    const alpha = color.length === 5 ? color[4] + color[4] : color.slice(7, 9);
    return parseInt(alpha, 16) < 255;
  }
  const fn = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\((.*)\)$/.exec(color);
  if (fn) {
    // The alpha is the fourth comma-separated value, or whatever follows a slash.
    const parts = fn[1].includes('/') ? fn[1].split('/') : fn[1].split(',');
    const alpha = fn[1].includes('/') ? parts[1] : parts[3];
    if (alpha === undefined) return false;
    const a = alpha.trim().endsWith('%') ? parseFloat(alpha) / 100 : parseFloat(alpha);
    return !(a >= 1);
  }
  // Named colours and plain hex are opaque; anything else — color-mix(), var() — is not known.
  return !/^(?:#[0-9a-f]{3}|#[0-9a-f]{6}|[a-z]+)$/.test(color);
}

/** Is this id used by anything — a <style> rule, a link, a paint or effect reference? */
function referenced(doc: Document, id: string): boolean {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const byUrl = new RegExp(`url\\(\\s*['"]?#${escaped}['"]?\\s*\\)`);
  const byRule = new RegExp(`#${escaped}(?![\\w-])`);
  for (const style of Array.from(doc.getElementsByTagName('style'))) {
    if (byRule.test(style.textContent ?? '')) return true;
  }
  for (const node of Array.from(doc.getElementsByTagName('*'))) {
    for (const attr of Array.from(node.attributes)) {
      if (attr.value === `#${id}` || byUrl.test(attr.value)) return true;
      if (attr.name === 'begin' || attr.name === 'end') {
        if (new RegExp(`(?:^|[;\\s])${escaped}\\.`).test(attr.value)) return true;
      }
    }
  }
  return false;
}

/** Why this element cannot be split at all, or undefined when it can. */
function unsplittable(el: Element): string | undefined {
  if (el.localName !== 'path') return `it is a <${el.localName}>, not a <path>`;
  if (el.children.length > 0) return 'it has child elements';
  // Anything that points at the id would reach only the part that keeps it: a #id rule would
  // style one part and leave the rest unstyled, a <use> would repeat one part.
  const id = el.getAttribute('id');
  if (id && el.ownerDocument && referenced(el.ownerDocument, id)) {
    return `its id "${id}" is referred to elsewhere in the document, and only one part could keep it`;
  }
  for (const marker of ['marker-start', 'marker-mid', 'marker-end', 'marker']) {
    if (inherited(el, marker)) return 'it carries markers, which would be repeated on every part';
  }
  // A gradient, pattern, filter, clip or mask is sized to the element's box by default, so each
  // part would get its own and the picture would change.
  if (/url\(/.test(`${inherited(el, 'fill') ?? ''} ${inherited(el, 'stroke') ?? ''}`)) {
    return 'its gradient or pattern is sized to the whole path';
  }
  for (const effect of ['filter', 'clip-path', 'mask']) {
    const own = declarations(el.getAttribute('style') ?? '').find(([k]) => k === effect)?.[1] ?? el.getAttribute(effect);
    if (own && own !== 'none') return `its ${effect} is sized to the whole path`;
  }
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (['defs', 'clipPath', 'mask', 'marker', 'pattern', 'symbol'].includes(node.localName)) {
      return `it sits inside <${node.localName}>, where one path cannot become several`;
    }
  }
  return undefined;
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

/** The read tool: every separable part of the matched paths, with where each one sits. */
export function describePathParts(source: string, selector: string): string {
  const validity = validateSvg(source);
  if (!validity.doc) {
    return `The document is not valid XML right now (${validity.message}), so paths cannot be addressed.`;
  }
  const doc = validity.doc;
  const found = resolveSelector(doc, selector);
  if (isSelectorError(found)) return `Error: ${found.error}`;
  if (found.length === 0) return `Nothing matched "${selector}": ${describeNoMatch(doc, selector)}`;
  const extents = elementExtents(source, doc);
  const MAX_PATHS = 10, MAX_PARTS = 40;
  const blocks = found.slice(0, MAX_PATHS).map((el) => {
    const extent = extents.get(el);
    const where = `${pathOf(el)}${extent ? ` (line ${lineOfOffset(source, extent.start)})` : ''}`;
    const refusal = unsplittable(el);
    if (refusal) return `${where}: cannot be split — ${refusal}.`;
    const parts = pathParts(el.getAttribute('d') ?? '', splitRiskOf(el, doc));
    if ('error' in parts) return `${where}: its path data could not be read (${parts.error}).`;
    if (parts.length <= 1) return `${where}: one shape — there is nothing to split.`;
    const whole = parts.map((p) => p.box).reduce(union);
    const w = whole.maxX - whole.minX || 1, h = whole.maxY - whole.minY || 1;
    const rows = parts
      .map((p, k) => ({ p, k }))
      .sort((a, b) => boxArea(b.p.box) - boxArea(a.p.box))
      .slice(0, MAX_PARTS)
      .map(({ p, k }) => {
        const cx = ((p.box.minX + p.box.maxX) / 2 - whole.minX) / w, cy = ((p.box.minY + p.box.maxY) / 2 - whole.minY) / h;
        return `  part ${k + 1}: x=${fmt(Math.round(p.box.minX))} y=${fmt(Math.round(p.box.minY))} w=${fmt(Math.round(p.box.maxX - p.box.minX))} h=${fmt(Math.round(p.box.maxY - p.box.minY))} — centred ${pct(cx)} across, ${pct(cy)} down; ${pct(boxArea(p.box) / (w * h))} of the path's box${p.subpaths > 1 ? `; ${p.subpaths} subpaths kept together` : ''}`;
      });
    const more = parts.length > MAX_PARTS ? `\n  … and ${parts.length - MAX_PARTS} smaller parts` : '';
    return `${where}: ${parts.length} separate parts, numbered in document order (largest listed first):\n${rows.join('\n')}${more}`;
  });
  const header = 'Boxes are in the path\'s own coordinates, before any transform. "Across" and "down" place a part\'s centre within the whole path\'s box, from the left and from the top. You cannot see the picture: judge which part is which from where it sits and its shape, and say in your reply which parts you took for what.';
  const extra = found.length > MAX_PATHS ? `\n… ${found.length - MAX_PATHS} more paths matched; address them one at a time.` : '';
  return `${header}\n${blocks.join('\n')}${extra}\nTo colour parts differently, split_path the path, giving a fill for each part you are changing; parts you leave out keep the colour they have.`;
}

/** One requested split: exactly one path, and optionally new fills for some of its parts. */
export interface PathSplit {
  selector: string;
  fills: Array<{ part: number; fill: string }>;
}

const START_TAG = /^<path\b(?:[^>"']|"[^"]*"|'[^']*')*?\s*(\/?)>/;

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Set an attribute in a start tag's text, leaving the rest of it byte for byte. */
function withAttribute(tag: string, name: string, value: string): string {
  const existing = new RegExp(`(\\s${name}\\s*=\\s*)("[^"]*"|'[^']*')`);
  if (existing.test(tag)) return tag.replace(existing, (_m, lead: string) => `${lead}"${escapeAttr(value)}"`);
  return `${tag} ${name}="${escapeAttr(value)}"`;
}

/** The style attribute with its fill set: inline style beats both a fill= and a <style> rule. */
function withFill(tag: string, fill: string): string {
  const style = /\sstyle\s*=\s*("([^"]*)"|'([^']*)')/.exec(tag);
  const decls = declarations(style ? (style[2] ?? style[3] ?? '') : '').filter(([k]) => k !== 'fill');
  decls.push(['fill', fill]);
  return withAttribute(tag, 'style', decls.map(([k, v]) => `${k}: ${v};`).join(' '));
}

/** The edit tool: replace each addressed path with one path per part, recoloured as asked. */
export function planPathSplits(
  source: string,
  edits: PathSplit[],
): { ranges: TextEditRange[]; outcomes: TextEditOutcome[]; available: boolean; reason?: string } {
  const validity = validateSvg(source);
  if (!validity.doc) {
    return {
      ranges: [], outcomes: [], available: false,
      reason: `the document is not valid XML right now (${validity.message}), so paths cannot be addressed. Use replace_lines until it parses.`,
    };
  }
  const doc = validity.doc;
  const extents = elementExtents(source, doc);
  const ranges: TextEditRange[] = [];
  const outcomes: TextEditOutcome[] = [];
  const fail = (label: string, matched: number, detail: string) => outcomes.push({ selector: label, status: 'failed', matched, ranges: [], detail });

  for (const edit of edits) {
    const label = `split ${JSON.stringify(edit.selector)}`;
    const found = resolveSelector(doc, edit.selector);
    if (isSelectorError(found)) { fail(label, 0, found.error); continue; }
    if (found.length === 0) { fail(label, 0, describeNoMatch(doc, edit.selector)); continue; }
    if (found.length > 1) {
      fail(label, found.length, `this matches ${found.length} elements; part numbers belong to one path, so address a single <path> — its positional path from list_path_parts`);
      continue;
    }
    const el = found[0];
    const refusal = unsplittable(el);
    if (refusal) { fail(label, 1, `cannot split it: ${refusal}`); continue; }
    const extent = extents.get(el);
    const text = extent ? source.slice(extent.start, extent.end) : '';
    const tag = START_TAG.exec(text);
    if (!extent || !tag || !(tag[1] === '/' ? tag[0].length === text.length : /^<\/path\s*>$/.test(text.slice(tag[0].length).trim()))) {
      fail(label, 1, 'its source could not be located exactly, so it was left alone');
      continue;
    }
    const parts = pathParts(el.getAttribute('d') ?? '', splitRiskOf(el, doc));
    if ('error' in parts) { fail(label, 1, `its path data could not be read (${parts.error})`); continue; }
    if (parts.length <= 1) { fail(label, 1, 'it is one shape — there is nothing to split. Recolour it with set_attribute instead'); continue; }

    const bad = edit.fills.find((f) => !Number.isInteger(f.part) || f.part < 1 || f.part > parts.length || !f.fill || /["<>;{}]/.test(f.fill));
    if (bad) {
      fail(label, 1, `fill for part ${JSON.stringify(bad.part)} is not usable: parts are numbered 1 to ${parts.length}, and a fill is a colour such as #A97C50`);
      continue;
    }
    const id = el.getAttribute('id');
    const ids = parts.map((_, k) => (id ? (k === 0 ? id : `${id}-${k + 1}`) : null));
    const taken = ids.slice(1).find((candidate) => candidate && doc.querySelector(`[id="${candidate.replace(/"/g, '\\"')}"]`));
    if (taken) { fail(label, 1, `the id "${taken}" a part would take is already in use`); continue; }

    const base = tag[0].replace(/\s*\/?>$/, '');
    const lineStart = source.lastIndexOf('\n', extent.start - 1) + 1;
    const indent = source.slice(lineStart, extent.start);
    const separator = /^[ \t]*$/.test(indent) ? `\n${indent}` : ' ';
    const pieces = parts.map((part, k) => {
      let piece = withAttribute(base, 'd', part.d);
      if (ids[k] && k > 0) piece = withAttribute(piece, 'id', ids[k]!);
      const fill = edit.fills.find((f) => f.part === k + 1);
      if (fill) piece = withFill(piece, fill.fill);
      return `${piece}/>`;
    });
    const range: TextEditRange = { start: extent.start, end: extent.end, replacement: pieces.join(separator) };
    ranges.push(range);
    // No detail on success: a note on an applied edit is how the card says "applied, but with no
    // visible effect", so a friendly "split into 8 paths" read as a warning over a recolour that
    // had worked.
    outcomes.push({ selector: label, status: 'applied', matched: 1, ranges: [range] });
  }
  return { ranges, outcomes, available: true };
}
