/**
 * Pure utility functions extracted from Preview.tsx for testability.
 */

export const LEVELS = [1, 2, 5, 10, 25, 50, 75, 100, 125, 150, 200, 300, 400, 500, 800, 1000, 1500, 2000, 3000, 5000];

/** Next zoom level up from the given percentage */
export const stepUp = (z: number) => LEVELS.find((l) => l > z) ?? Math.round(z * 1.5);

/** Next zoom level down from the given percentage */
export const stepDown = (z: number) => [...LEVELS].reverse().find((l) => l < z) ?? Math.max(1, Math.round(z / 1.5));

/** Check whether a string represents an absolute CSS length (e.g. "100", "100px") */
export const isAbsoluteLength = (v: string) => /^[\d.]+(?:px)?$/.test(v.trim());

/** Compute viewBox from getBBox, falling back to `fw x fh` if getBBox fails. */
export function synthesizeViewBox(svg: SVGSVGElement, fw: number, fh: number) {
  try {
    const bb = svg.getBBox();
    if (bb.width > 0 && bb.height > 0) {
      const x = Math.min(0, bb.x);
      const y = Math.min(0, bb.y);
      const w = Math.max(fw, bb.x + bb.width) - x;
      const h = Math.max(fh, bb.y + bb.height) - y;
      svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
      return { w, h };
    }
  } catch { /* not rendered */ }
  if (fw > 0 && fh > 0) {
    svg.setAttribute('viewBox', `0 0 ${fw} ${fh}`);
    return { w: fw, h: fh };
  }
  return null;
}

/**
 * Does the drawing reach outside a `w` x `h` viewport?
 *
 * Tells apart the two kinds of SVG that carry percentage width/height: one laid
 * out from percentages, which fills whatever box it is given and never exceeds
 * it, and one anchored to absolute coordinates, which ignores the box entirely.
 * Only the second kind needs a viewBox to be seen whole.
 */
export function contentOverflowsViewport(svg: SVGSVGElement, w: number, h: number) {
  try {
    const bb = svg.getBBox();
    if (bb.width <= 0 || bb.height <= 0) return false;
    // A stroke or a glyph descender can put a percentage-sized shape a hair past
    // the edge, so only a real overhang counts.
    const slack = 1;
    return bb.x < -slack || bb.y < -slack || bb.x + bb.width > w + slack || bb.y + bb.height > h + slack;
  } catch {
    return false; // not rendered, so nothing measurable to overflow
  }
}

/** Find the nearest meaningful SVG child element from a click/hover target */
export function findSvgTarget(target: Element, svg: SVGSVGElement, container: HTMLDivElement): Element | null {
  while (target && target !== svg && target !== container) {
    if (target instanceof SVGElement && target.tagName !== 'svg') return target;
    target = target.parentElement as Element;
  }
  return null;
}

/**
 * Resolve a positional xpath like "/svg[1]/g[2]/path[3]" against a rendered SVG element.
 * Returns the matching element, or null if the path can't be resolved.
 */
export function resolveXPath(svg: SVGSVGElement, xpath: string): SVGElement | null {
  const steps = xpath.split('/').filter(Boolean);
  let current: Element = svg;

  // Skip the first step if it matches the root svg
  const firstStep = steps[0];
  if (firstStep) {
    const m = firstStep.match(/^([a-z][\w.-]*)\[(\d+)\]$/i);
    if (m && m[1].toLowerCase() === current.tagName.toLowerCase()) {
      steps.shift();
    }
  }

  for (const step of steps) {
    const m = step.match(/^([a-z][\w.-]*)\[(\d+)\]$/i);
    if (!m) return null;
    const tag = m[1].toLowerCase();
    const idx = parseInt(m[2], 10);
    const children = Array.from(current.children).filter(c => c.tagName.toLowerCase() === tag);
    const child = children[idx - 1];
    if (!child) return null;
    current = child;
  }

  if (current === svg) return null;
  return current instanceof SVGElement ? current : null;
}
