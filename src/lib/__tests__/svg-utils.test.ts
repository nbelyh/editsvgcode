import { describe, it, expect } from 'vitest';
import { stripBom, findElementRange, findElementAtOffset, computeXPath, getNewUniqueId, formatXml } from '../svg-utils';

// ---------------------------------------------------------------------------
// stripBom
// ---------------------------------------------------------------------------
describe('stripBom', () => {
  it('removes BOM from the beginning of text', () => {
    expect(stripBom('\uFEFFhello')).toBe('hello');
  });

  it('leaves normal text untouched', () => {
    expect(stripBom('hello')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(stripBom('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// getNewUniqueId
// ---------------------------------------------------------------------------
describe('getNewUniqueId', () => {
  it('returns a non-empty string', () => {
    expect(getNewUniqueId().length).toBeGreaterThan(0);
  });

  it('returns unique values on subsequent calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => getNewUniqueId()));
    expect(ids.size).toBe(20);
  });

  it('contains only alphanumeric characters', () => {
    const id = getNewUniqueId();
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});

// ---------------------------------------------------------------------------
// findElementRange
// ---------------------------------------------------------------------------
describe('findElementRange', () => {
  const svg = `<svg>
  <rect width="100" height="100" />
  <circle cx="50" cy="50" r="25" />
  <rect width="200" height="200" />
</svg>`;

  it('finds the first occurrence of a tag', () => {
    const range = findElementRange(svg, 'rect', 0);
    expect(range).toBeDefined();
    expect(range!.startLine).toBe(2);
  });

  it('finds the second occurrence of a tag', () => {
    const range = findElementRange(svg, 'rect', 1);
    expect(range).toBeDefined();
    expect(range!.startLine).toBe(4);
  });

  it('returns null for out-of-range index', () => {
    expect(findElementRange(svg, 'rect', 5)).toBeNull();
  });

  it('returns null for non-existent tag', () => {
    expect(findElementRange(svg, 'ellipse', 0)).toBeNull();
  });

  it('returns null for empty tagName', () => {
    expect(findElementRange(svg, '', 0)).toBeNull();
  });

  it('returns null for negative index', () => {
    expect(findElementRange(svg, 'rect', -1)).toBeNull();
  });

  it('handles self-closing tags', () => {
    const range = findElementRange(svg, 'rect', 0);
    expect(range).toBeDefined();
    // Should end at the "/>" of the self-closing tag
    expect(range!.endLine).toBe(2);
  });

  it('handles tags with closing elements', () => {
    const code = '<svg><g id="group"><rect/></g></svg>';
    const range = findElementRange(code, 'g', 0);
    expect(range).toBeDefined();
    // Should span from <g to </g>
    expect(range!.startLine).toBe(1);
    expect(range!.endLine).toBe(1);
  });

  it('is case-insensitive for tag matching', () => {
    const code = '<SVG><Rect width="100" /></SVG>';
    const range = findElementRange(code, 'Rect', 0);
    expect(range).toBeDefined();
  });

  it('computes correct columns on single-line SVG', () => {
    const code = '<svg><rect/></svg>';
    const range = findElementRange(code, 'rect', 0);
    expect(range).toBeDefined();
    expect(range!.startLine).toBe(1);
    expect(range!.startCol).toBe(6); // after '<svg>'
    expect(range!.endCol).toBe(13); // after '<rect/>'
  });
});

// ---------------------------------------------------------------------------
// formatXml
// ---------------------------------------------------------------------------
describe('formatXml', () => {
  it('formats a single-line SVG with indentation', () => {
    const input = '<svg><rect/></svg>';
    const output = formatXml(input);
    const lines = output.split('\n');
    expect(lines.length).toBeGreaterThan(1);
    expect(lines[0].trim()).toBe('<svg>');
    expect(lines[lines.length - 1].trim()).toBe('</svg>');
  });

  it('preserves self-closing tags', () => {
    const input = '<svg><rect/></svg>';
    const output = formatXml(input);
    expect(output).toContain('<rect/>');
  });

  it('handles already formatted XML', () => {
    const input = '<svg>\n  <rect/>\n</svg>';
    const output = formatXml(input);
    expect(output).toContain('<rect/>');
    expect(output).toContain('<svg>');
    expect(output).toContain('</svg>');
  });

  it('handles empty string', () => {
    expect(formatXml('')).toBe('');
  });

  it('gives a closing tag its own line instead of trailing the text element', () => {
    // The whole point: an edit to the label must not have to reproduce </g> too.
    const out = formatXml('<svg><g><text x="4">dbo</text></g></svg>');
    expect(out).toBe('<svg>\n  <g>\n    <text x="4">dbo</text>\n  </g>\n</svg>');
  });

  it('keeps a text element and its tspans on one line, byte for byte', () => {
    // A line break inside <text> would land in the rendered label.
    const text = '<text x="4">AdventureWorks<tspan x="4" dy="1.2em">November 2005</tspan></text>';
    expect(formatXml(`<svg>${text}</svg>`)).toBe(`<svg>\n  ${text}\n</svg>`);
  });

  it('preserves significant whitespace inside a text element', () => {
    const text = '<text>rowguid <tspan> </tspan> ModifiedDate</text>';
    expect(formatXml(`<svg>${text}</svg>`)).toContain(text);
  });

  it('keeps CSS inside <style> intact and unindented', () => {
    // Whitespace at the edges of a CSS block is meaningless, so the formatter
    // trimming it is fine; what must survive is every rule, unindented — CSS is
    // not XML and must not be laid out as if it were.
    const style = '<style type="text/css">\n.st1 {fill:#800080;}\n.st2 {font-size:1em;}\n</style>';
    const out = formatXml(`<svg>${style}</svg>`);
    expect(out).toContain('.st1 {fill:#800080;}');
    expect(out).toContain('.st2 {font-size:1em;}');
    expect(out).not.toContain('  .st1');
  });

  it('drops layout whitespace between elements', () => {
    expect(formatXml('<svg>\n\t\t<g>\n\t\t\t<rect/>\n\t\t</g>\n</svg>'))
      .toBe('<svg>\n  <g>\n    <rect/>\n  </g>\n</svg>');
  });

  it('indents by nesting depth', () => {
    const out = formatXml('<svg><g><g><rect/></g></g></svg>').split('\n');
    expect(out[2]).toBe('    <g>');
    expect(out[3]).toBe('      <rect/>');
  });

  it('is not fooled by a ">" inside an attribute value', () => {
    const out = formatXml('<svg><rect data-note="a > b"/></svg>');
    expect(out).toBe('<svg>\n  <rect data-note="a > b"/>\n</svg>');
  });

  it('keeps comments and processing instructions', () => {
    const out = formatXml('<?xml version="1.0"?><svg><!-- note --><rect/></svg>');
    expect(out).toContain('<?xml version="1.0"?>');
    expect(out).toContain('<!-- note -->');
  });

  it('handles nested elements of the same name', () => {
    const text = '<text>a<tspan>b<tspan>c</tspan></tspan></text>';
    expect(formatXml(`<svg>${text}</svg>`)).toContain(text);
  });

  it('is idempotent', () => {
    const once = formatXml('<svg><g><text x="4">dbo</text></g></svg>');
    expect(formatXml(once)).toBe(once);
  });

  it('does not throw on invalid markup, and keeps the content', () => {
    // A text editor sees half-typed documents constantly.
    expect(() => formatXml('<svg><g><rect fill="red"')).not.toThrow();
    expect(formatXml('<svg><text>unclosed')).toContain('unclosed');
    expect(formatXml('<svg><text>a</text></g></svg>')).toContain('<text>a</text>');
  });

  it('returns input untouched when there is no markup at all', () => {
    expect(formatXml('just some text')).toBe('just some text');
  });
});

// ---------------------------------------------------------------------------
// findElementAtOffset
// ---------------------------------------------------------------------------
describe('findElementAtOffset', () => {
  const svg = `<svg>
  <g id="group">
    <rect width="100" />
    <circle cx="50" />
  </g>
  <path d="M0 0" />
</svg>`;

  it('returns null for offset outside any element', () => {
    expect(findElementAtOffset('', 0)).toBeNull();
  });

  it('returns null for invalid XML', () => {
    expect(findElementAtOffset('<svg><not closed', 5)).toBeNull();
  });

  it('finds the root svg element', () => {
    const result = findElementAtOffset(svg, 1);
    expect(result).not.toBeNull();
    expect(result!.xpath).toBe('/svg[1]');
  });

  it('finds a nested element at its offset', () => {
    const rectOffset = svg.indexOf('<rect');
    const result = findElementAtOffset(svg, rectOffset + 1);
    expect(result).not.toBeNull();
    expect(result!.xpath).toBe('/svg[1]/g[1]/rect[1]');
    expect(result!.element).toContain('rect');
  });

  it('finds the tightest enclosing element', () => {
    const circleOffset = svg.indexOf('<circle');
    const result = findElementAtOffset(svg, circleOffset + 2);
    expect(result).not.toBeNull();
    expect(result!.xpath).toBe('/svg[1]/g[1]/circle[1]');
  });

  it('returns correct line range', () => {
    const pathOffset = svg.indexOf('<path');
    const result = findElementAtOffset(svg, pathOffset);
    expect(result).not.toBeNull();
    expect(result!.startLine).toBe(6);
    expect(result!.endLine).toBe(6);
  });

  it('finds parent (g) when cursor is between children', () => {
    // Place cursor on whitespace between rect and circle (inside g)
    const afterRect = svg.indexOf('/>') + 2; // after first />
    const result = findElementAtOffset(svg, afterRect + 2);
    expect(result).not.toBeNull();
    // Should be inside g since we're between children
    expect(result!.xpath).toMatch(/\/svg\[1\]\/g\[1\]/);
  });

  it('handles self-closing elements', () => {
    const pathOffset = svg.indexOf('<path');
    const result = findElementAtOffset(svg, pathOffset);
    expect(result).not.toBeNull();
    expect(result!.element).toContain('<path');
    expect(result!.element).toContain('/>');
  });
});

// ---------------------------------------------------------------------------
// computeXPath
// ---------------------------------------------------------------------------
describe('computeXPath', () => {
  it('computes xpath for root element', () => {
    const doc = new DOMParser().parseFromString('<svg></svg>', 'text/xml');
    expect(computeXPath(doc.documentElement)).toBe('/svg[1]');
  });

  it('computes xpath for nested element', () => {
    const doc = new DOMParser().parseFromString('<svg><g><rect/></g></svg>', 'text/xml');
    const rect = doc.querySelector('rect')!;
    expect(computeXPath(rect)).toBe('/svg[1]/g[1]/rect[1]');
  });

  it('handles sibling indexing', () => {
    const doc = new DOMParser().parseFromString(
      '<svg><rect/><rect/><circle/><rect/></svg>',
      'text/xml',
    );
    const rects = doc.querySelectorAll('rect');
    expect(computeXPath(rects[0])).toBe('/svg[1]/rect[1]');
    expect(computeXPath(rects[1])).toBe('/svg[1]/rect[2]');
    expect(computeXPath(rects[2])).toBe('/svg[1]/rect[3]');
    const circle = doc.querySelector('circle')!;
    expect(computeXPath(circle)).toBe('/svg[1]/circle[1]');
  });

  it('handles deeply nested elements', () => {
    const doc = new DOMParser().parseFromString(
      '<svg><g><g><path/></g></g></svg>',
      'text/xml',
    );
    const path = doc.querySelector('path')!;
    expect(computeXPath(path)).toBe('/svg[1]/g[1]/g[1]/path[1]');
  });
});
