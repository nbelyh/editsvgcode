/**
 * Client-side SVG element bounding-box computation.
 * Renders the SVG in a hidden off-screen container and uses getBBox() to measure elements.
 */

import { sanitizeSvg } from './sanitize';
import { resolveWithin, isSelectorError, isLineAddress, lineAddressToPath } from './svg-dom';

export interface ElementBounds {
  selector: string;
  tagName: string;
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Measurement {
  viewBox: string;
  width: string;
  height: string;
  /** Every element the selector matched, drawn or not. */
  matched: number;
  /** The drawn ones among the first `limit` matches, in viewBox coordinates. */
  boxes: ElementBounds[];
}

/**
 * Measure what a selector matches, in viewBox coordinates — the numbers both
 * get_element_bounds and get_png_image report. `limit` caps how many matches are
 * measured; the count of matches is always the full one.
 */
export function measureElements(svgCode: string, selector: string, limit = Infinity): Measurement | { error: string } {
  // Create off-screen container
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1000px;height:1000px;visibility:hidden;';
  document.body.appendChild(container);

  try {
    // Strips scripts/event handlers; geometry is unaffected
    container.innerHTML = sanitizeSvg(svgCode);
    const svgEl = container.querySelector('svg');
    if (!svgEl) {
      return { error: 'Error: no <svg> element found in the document.' };
    }

    // Every address form, same as every other tool: a line or a path names one
    // element, a CSS selector names a set. A line is read against the source, since
    // this copy of the document was parsed as HTML and keeps no line numbers.
    const target = isLineAddress(selector) ? lineAddressToPath(svgCode, selector) : selector;
    if (isSelectorError(target)) return { error: `Error: ${target.error}` };
    const found = resolveWithin(svgEl, target);
    if (isSelectorError(found)) return { error: `Error: ${found.error}` };

    const boxes: ElementBounds[] = [];
    for (const el of found.slice(0, limit)) {
      if (!(el instanceof SVGGraphicsElement)) continue;
      try {
        const bbox = el.getBBox();

        // Transform bbox corners from element-local coords → viewBox coords
        // using the cumulative transform matrix (CTM).
        // elCTM maps element-local → screen; svgCTM maps viewBox → screen.
        // So svgCTM⁻¹ · elCTM maps element-local → viewBox.
        const elCTM = el.getScreenCTM();
        const svgCTM = svgEl.getScreenCTM();
        if (!elCTM || !svgCTM) continue; // not rendered (inside <defs>, display:none, etc.)

        const m = svgCTM.inverse().multiply(elCTM);

        // Transform all 4 corners and take the axis-aligned bounding rect.
        // This handles rotation; for pure translate+scale 2 corners would suffice,
        // but the general case needs all 4.
        const corners = [
          { x: bbox.x, y: bbox.y },
          { x: bbox.x + bbox.width, y: bbox.y },
          { x: bbox.x, y: bbox.y + bbox.height },
          { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
        ].map(p => ({
          x: m.a * p.x + m.c * p.y + m.e,
          y: m.b * p.x + m.d * p.y + m.f,
        }));
        const xs = corners.map(c => c.x);
        const ys = corners.map(c => c.y);
        const x1 = Math.min(...xs);
        const y1 = Math.min(...ys);
        const x2 = Math.max(...xs);
        const y2 = Math.max(...ys);
        boxes.push({
          selector,
          tagName: el.tagName.toLowerCase(),
          id: el.id || undefined,
          x: Math.round(x1 * 100) / 100,
          y: Math.round(y1 * 100) / 100,
          width: Math.round((x2 - x1) * 100) / 100,
          height: Math.round((y2 - y1) * 100) / 100,
        });
      } catch {
        // getBBox can throw for elements with no visual representation
      }
    }

    return {
      viewBox: svgEl.getAttribute('viewBox') || 'not set',
      width: svgEl.getAttribute('width') || 'auto',
      height: svgEl.getAttribute('height') || 'auto',
      matched: found.length,
      boxes,
    };
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Measure bounding boxes of elements matching a CSS selector in the given SVG code.
 * Returns a formatted string for the model.
 */
export function getElementBounds(svgCode: string, selector: string): string {
  // Limit results to avoid overwhelming the model
  const maxResults = 30;
  const measured = measureElements(svgCode, selector, maxResults);
  if ('error' in measured) return measured.error;
  const { matched, boxes: results } = measured;

  if (matched === 0) {
    return `No elements matched "${selector}". Note that this tool only measures what is DRAWN, so gradients, <defs> contents and hidden elements never appear here — use query to see everything.`;
  }

  if (results.length === 0) {
    return `Elements matched "${selector}" but none have measurable bounds (may be non-visual elements like <defs>, <clipPath>).`;
  }

  // Format output
  const header = `SVG canvas: viewBox="${measured.viewBox}", width="${measured.width}", height="${measured.height}"`;
  const rows = results.map((r, i) => {
    const idPart = r.id ? ` id="${r.id}"` : '';
    return `${i + 1}. <${r.tagName}${idPart}> — x=${r.x}, y=${r.y}, width=${r.width}, height=${r.height}`;
  });
  const truncated = matched > maxResults ? `\n(showing ${maxResults} of ${matched} matches)` : '';
  return `${header}\n\nBounding boxes for "${selector}" (${results.length} element${results.length > 1 ? 's' : ''}):\n${rows.join('\n')}${truncated}`;
}
