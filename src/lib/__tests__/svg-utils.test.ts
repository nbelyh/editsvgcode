import { describe, it, expect } from 'vitest';
import { stripBom, findElementRange, getNewUniqueId, formatXml } from '../svg-utils';

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
});
