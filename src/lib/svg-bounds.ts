/**
 * Client-side SVG element bounding-box computation.
 * Renders the SVG in a hidden off-screen container and uses getBBox() to measure elements.
 */

export interface ElementBounds {
  selector: string;
  tagName: string;
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Measure bounding boxes of elements matching a CSS selector in the given SVG code.
 * Returns a formatted string for the model.
 */
export function getElementBounds(svgCode: string, selector: string): string {
  // Create off-screen container
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1000px;height:1000px;visibility:hidden;';
  document.body.appendChild(container);

  try {
    container.innerHTML = svgCode;
    const svgEl = container.querySelector('svg');
    if (!svgEl) {
      return 'Error: no <svg> element found in the document.';
    }

    // Get the viewBox for context
    const viewBox = svgEl.getAttribute('viewBox') || 'not set';
    const svgWidth = svgEl.getAttribute('width') || 'auto';
    const svgHeight = svgEl.getAttribute('height') || 'auto';

    let elements: Element[];
    try {
      elements = Array.from(svgEl.querySelectorAll(selector));
    } catch {
      return `Error: invalid CSS selector "${selector}". Use standard CSS selectors like "circle", "#myId", ".myClass", "rect:nth-child(2)".`;
    }

    if (elements.length === 0) {
      return `No elements matched selector "${selector}". Check the selector and try again.`;
    }

    // Limit results to avoid overwhelming the model
    const maxResults = 30;
    const results: ElementBounds[] = [];

    for (const el of elements.slice(0, maxResults)) {
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
        results.push({
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

    if (results.length === 0) {
      return `Elements matched "${selector}" but none have measurable bounds (may be non-visual elements like <defs>, <clipPath>).`;
    }

    // Format output
    const header = `SVG canvas: viewBox="${viewBox}", width="${svgWidth}", height="${svgHeight}"`;
    const rows = results.map((r, i) => {
      const idPart = r.id ? ` id="${r.id}"` : '';
      return `${i + 1}. <${r.tagName}${idPart}> — x=${r.x}, y=${r.y}, width=${r.width}, height=${r.height}`;
    });
    const truncated = elements.length > maxResults ? `\n(showing ${maxResults} of ${elements.length} matches)` : '';
    return `${header}\n\nBounding boxes for "${selector}" (${results.length} element${results.length > 1 ? 's' : ''}):\n${rows.join('\n')}${truncated}`;
  } finally {
    document.body.removeChild(container);
  }
}
