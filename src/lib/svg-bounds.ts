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
        results.push({
          selector,
          tagName: el.tagName.toLowerCase(),
          id: el.id || undefined,
          x: Math.round(bbox.x * 100) / 100,
          y: Math.round(bbox.y * 100) / 100,
          width: Math.round(bbox.width * 100) / 100,
          height: Math.round(bbox.height * 100) / 100,
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
