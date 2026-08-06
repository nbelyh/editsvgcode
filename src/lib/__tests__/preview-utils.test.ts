import { describe, it, expect } from 'vitest';
import { stepUp, stepDown, isAbsoluteLength, resolveXPath, contentOverflowsViewport, LEVELS } from '../preview-utils';

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
/** jsdom has no layout, so stand in for getBBox with a fixed box. */
function svgWithBBox(bb: { x: number; y: number; width: number; height: number } | 'throws'): SVGSVGElement {
  return {
    getBBox() {
      if (bb === 'throws') throw new Error('not rendered');
      return bb;
    },
  } as unknown as SVGSVGElement;
}

describe('contentOverflowsViewport', () => {
  it('reports no overflow when the drawing exactly fills the viewport', () => {
    // What percentage-laid-out content does: <rect width="100%" height="100%"/>
    expect(contentOverflowsViewport(svgWithBBox({ x: 0, y: 0, width: 631, height: 657 }), 631, 657)).toBe(false);
  });

  it('reports no overflow when the drawing is smaller than the viewport', () => {
    expect(contentOverflowsViewport(svgWithBBox({ x: 10, y: 10, width: 100, height: 100 }), 631, 657)).toBe(false);
  });

  it('reports overflow when absolute coordinates run past the viewport', () => {
    // The Visio-style export: width="100%" but content drawn at ~2679x1660
    expect(contentOverflowsViewport(svgWithBBox({ x: 0, y: 0, width: 2679, height: 1660 }), 631, 657)).toBe(true);
  });

  it('reports overflow when content sits above or left of the origin', () => {
    expect(contentOverflowsViewport(svgWithBBox({ x: -50, y: 0, width: 100, height: 100 }), 631, 657)).toBe(true);
    expect(contentOverflowsViewport(svgWithBBox({ x: 0, y: -50, width: 100, height: 100 }), 631, 657)).toBe(true);
  });

  it('tolerates a sub-pixel overhang from a stroke or descender', () => {
    expect(contentOverflowsViewport(svgWithBBox({ x: -0.5, y: 0, width: 631.5, height: 657.5 }), 631, 657)).toBe(false);
  });

  it('reports no overflow for an empty drawing', () => {
    expect(contentOverflowsViewport(svgWithBBox({ x: 0, y: 0, width: 0, height: 0 }), 631, 657)).toBe(false);
  });

  it('reports no overflow when the element cannot be measured', () => {
    expect(contentOverflowsViewport(svgWithBBox('throws'), 631, 657)).toBe(false);
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
