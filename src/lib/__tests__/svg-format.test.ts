import { describe, it, expect } from 'vitest';
import { formatXml } from '../svg-utils';

/** What a reader actually sees — the property formatting must never change. */
const rendered = (svg: string) =>
  (svg.match(/<(?:text|tspan|title|desc)\b[^>]*>([^<]*)/gi) ?? []).join('|');

describe('formatXml — lays out structure', () => {
  it('puts a closing tag that trailed a text element on its own line', () => {
    // The line shape that made every label edit risky: changing the label meant
    // reproducing `</text>\t\t</g>` exactly or breaking the nesting.
    const out = formatXml('<svg xml:space="preserve"><g><text>dbo</text>\t\t</g></svg>');
    const lines = out.split('\n');

    expect(lines.some((l) => l.trim() === '<text>dbo</text>')).toBe(true);
    expect(lines.some((l) => l.trim() === '</g>')).toBe(true);
    expect(lines.some((l) => /<\/text>\s*<\/g>/.test(l))).toBe(false);
  });

  it('formats despite xml:space on the root, and restores the attribute', () => {
    const out = formatXml('<svg xml:space="preserve"><g><rect/></g></svg>');

    expect(out.split('\n').length).toBeGreaterThan(1);
    expect(out).toContain('xml:space="preserve"');
    expect(out).not.toContain('data-preserve-during-format');
  });

  it('handles the attribute in single quotes or with spaces around =', () => {
    for (const root of ['<svg xml:space=\'preserve\'>', '<svg xml:space = "preserve">']) {
      const out = formatXml(`${root}<g><rect/></g></svg>`);
      expect(out.split('\n').length).toBeGreaterThan(1);
      expect(out).not.toContain('data-preserve-during-format');
    }
  });

  it('formats a document with no xml:space at all', () => {
    expect(formatXml('<svg><g><rect/></g></svg>').split('\n').length).toBeGreaterThan(1);
  });

  // Real exports rarely start at <svg>. Anchoring the mask there made formatting
  // a silent no-op for most of the files this feature exists to handle.
  it.each([
    ['XML declaration', '<?xml version="1.0" encoding="UTF-8"?>\n'],
    ['DOCTYPE', '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "svg11.dtd">\n'],
    ['generator comment', '<!-- Generator: Adobe Illustrator 27.0 -->\n'],
    ['declaration + comment', '<?xml version="1.0"?>\n<!-- Generator: Inkscape -->\n'],
  ])('formats past a %s before the root', (_name, prologue) => {
    const svg = `${prologue}<svg xml:space="preserve"><g><text>dbo</text>\t\t</g></svg>`;
    const out = formatXml(svg);

    expect(out).not.toBe(svg);
    expect(out.split('\n').some((l) => l.trim() === '</g>')).toBe(true);
    expect(out).toContain('xml:space="preserve"');
    expect(out).not.toContain('data-preserve-during-format');
  });

  it('does not mask a nested svg when the root has no xml:space', () => {
    // The attribute on a nested element is a real instruction about that
    // element, not a formatter-blocking accident on the root.
    const svg = '<svg><g><svg xml:space="preserve"><text>x</text></svg></g></svg>';
    expect(formatXml(svg)).not.toContain('data-preserve-during-format');
  });
});

describe('formatXml — never changes what renders', () => {
  it('leaves a document alone when formatting would re-indent text children', () => {
    // <text> whose children are all elements gets expanded by the formatter, and
    // under xml:space="preserve" that indentation renders as extra spaces.
    const svg = '<svg xml:space="preserve"><text><tspan>a</tspan>\n<tspan>b</tspan></text></svg>';
    const out = formatXml(svg);

    expect(rendered(out)).toBe(rendered(svg));
    expect(out).toBe(svg);
  });

  it('preserves significant whitespace inside a text element it does format', () => {
    const svg = '<svg xml:space="preserve"><g><text>rowguid <tspan> </tspan><tspan> ModifiedDate</tspan></text></g></svg>';
    const out = formatXml(svg);

    expect(rendered(out)).toBe(rendered(svg));
    expect(out).toContain('<text>rowguid <tspan> </tspan><tspan> ModifiedDate</tspan></text>');
  });

  it('keeps leading, trailing and repeated spaces', () => {
    for (const label of ['  padded  ', 'a     b', 'a\tb']) {
      const svg = `<svg xml:space="preserve"><g><text>${label}</text></g></svg>`;
      expect(rendered(formatXml(svg))).toBe(rendered(svg));
    }
  });

  it('never emits the internal mask attribute', () => {
    const svg = '<svg xml:space="preserve"><g><text>x</text></g></svg>';
    expect(formatXml(svg)).not.toContain('data-preserve-during-format');
  });
});

describe('formatXml — refuses rather than mangles', () => {
  it('returns invalid markup untouched', () => {
    const broken = '<svg><g><text>half typed';
    expect(formatXml(broken)).toBe(broken);
  });

  it('returns empty input untouched', () => {
    expect(formatXml('')).toBe('');
    expect(formatXml('   ')).toBe('   ');
  });

  it('is idempotent', () => {
    const once = formatXml('<svg xml:space="preserve"><g><text>dbo</text>\t\t</g></svg>');
    expect(formatXml(once)).toBe(once);
  });
});
