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

/** Find the nearest meaningful SVG child element from a click/hover target */
export function findSvgTarget(target: Element, svg: SVGSVGElement, container: HTMLDivElement): Element | null {
  while (target && target !== svg && target !== container) {
    if (target instanceof SVGElement && target.tagName !== 'svg') return target;
    target = target.parentElement as Element;
  }
  return null;
}
