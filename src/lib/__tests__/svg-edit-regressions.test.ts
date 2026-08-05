/**
 * Regressions in the edit pipeline, each one a bug that shipped.
 *
 * Kept as their own file because they share nothing but a cause: every one is a
 * case where an edit reported success and quietly did something other than what
 * was asked. That is the failure mode this whole layer exists to remove, so it
 * is worth being able to see them in one place.
 */
import { describe, it, expect } from 'vitest';
import { planStructuralEdits, applyPlannedBatches, applyRanges } from '../svg-ai';
import { parseSvg } from '../svg-dom';

const CSS_DOC = [
  '<svg xmlns="http://www.w3.org/2000/svg">',
  '  <style>.st1 {fill:purple;}</style>',
  '  <rect id="a" class="st1" width="1"/>',
  '  <text id="t"></text>',
  '  <g id="box"><rect id="in"/></g>',
  '  <g id="empty"></g>',
  '</svg>',
].join('\n');

const apply = (src: string, tool: string, args: unknown) => {
  const { planned, available } = planStructuralEdits(src, tool, args);
  if (!available) return { svg: src, outcomes: [] };
  const { svgAfter, outcomes } = applyPlannedBatches(src, [planned]);
  return { svg: svgAfter[0] ?? src, outcomes: outcomes[0] ?? [] };
};

describe('an attribute name is never compiled into a regex unescaped', () => {
  it('does not throw the turn away', () => {
    expect(() => apply(CSS_DOC, 'set_attribute', {
      edits: [{ selector: '#a', name: 'fi(ll', value: 'red' }],
    })).not.toThrow();
  });
});

describe('two insertions at one anchor keep their order', () => {
  it('applyRanges preserves request order for zero-width spans', () => {
    const out = applyRanges('AB', [
      { start: 1, end: 1, replacement: 'FIRST' },
      { start: 1, end: 1, replacement: 'SECOND' },
    ]);
    expect(out).toBe('AFIRSTSECONDB');
  });

  it('insert_element emits them in the order asked', () => {
    const { svg } = apply(CSS_DOC, 'insert_element', {
      edits: [
        { selector: '#a', position: 'after', svg: '<desc>one</desc>' },
        { selector: '#a', position: 'after', svg: '<desc>two</desc>' },
      ],
    });
    expect(svg.indexOf('one')).toBeLessThan(svg.indexOf('two'));
  });
});

describe('two insert calls at one anchor both land', () => {
  it('does not drop the second as a conflict', () => {
    const a = planStructuralEdits(CSS_DOC, 'insert_element', {
      edits: [{ selector: '#a', position: 'after', svg: '<desc>one</desc>' }],
    }).planned;
    const b = planStructuralEdits(CSS_DOC, 'insert_element', {
      edits: [{ selector: '#a', position: 'after', svg: '<desc>two</desc>' }],
    }).planned;
    const { final, outcomes } = applyPlannedBatches(CSS_DOC, [a, b]);
    expect(outcomes[1][0].status).toBe('applied');
    expect(final).toContain('one');
    expect(final).toContain('two');
  });
});

describe('set_text on an empty element', () => {
  it('fills it instead of refusing', () => {
    const { svg, outcomes } = apply(CSS_DOC, 'set_text', { edits: [{ selector: '#t', text: 'hello' }] });
    expect(outcomes[0].status).toBe('applied');
    expect(svg).toContain('<text id="t">hello</text>');
  });

  it('round-trips: clearing then refilling', () => {
    const cleared = apply(CSS_DOC, 'set_text', { edits: [{ selector: '#t', text: '' }] }).svg;
    const { outcomes } = apply(cleared, 'set_text', { edits: [{ selector: '#t', text: 'back' }] });
    expect(outcomes[0].status).toBe('applied');
  });
});

describe('attribute names are validated', () => {
  it('refuses an empty name rather than rewriting a different attribute', () => {
    const { svg, outcomes } = apply(CSS_DOC, 'set_attribute', {
      edits: [{ selector: '#a', name: '', value: 'zzz' }],
    });
    expect(outcomes[0].status).toBe('failed');
    expect(svg).toBe(CSS_DOC);
  });

  it('refuses a name that would break well-formedness', () => {
    for (const name of ['a b', 'a"b', 'a=b', '<a>']) {
      const { svg, outcomes } = apply(CSS_DOC, 'set_attribute', {
        edits: [{ selector: '#a', name, value: 'v' }],
      });
      expect({ name, status: outcomes[0].status }).toEqual({ name, status: 'failed' });
      expect(svg).toBe(CSS_DOC);
    }
  });
});

describe('child insertion leaves clean layout', () => {
  it('first-child does not leave a whitespace-only line', () => {
    const { svg } = apply(CSS_DOC, 'insert_element', {
      edits: [{ selector: '#box', position: 'first-child', svg: '<desc>d</desc>' }],
    });
    expect(svg.split('\n').filter((l) => l.trim() === '')).toHaveLength(0);
    expect(svg).not.toMatch(/[ \t]+$/m);
    expect(parseSvg(svg)).not.toBeNull();
  });

  it('last-child on a childless element does not strand the closing tag', () => {
    const { svg } = apply(CSS_DOC, 'insert_element', {
      edits: [{ selector: '#empty', position: 'last-child', svg: '<desc>d</desc>' }],
    });
    expect(svg).toMatch(/<desc>d<\/desc>\n\s*<\/g>/);
    expect(parseSvg(svg)).not.toBeNull();
  });
});
