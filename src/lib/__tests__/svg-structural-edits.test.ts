import { describe, it, expect } from 'vitest';
import {
  planStructuralEdits, isStructuralEditTool, applyPlannedBatches,
  lineEditsToPlanned, summarizeEdits,
} from '../svg-ai';

const DOC = [
  '<svg xmlns="http://www.w3.org/2000/svg">',
  '  <style>.st3 { fill: purple; }</style>',
  '  <rect id="a" class="st1" fill="red" width="10"/>',
  '  <rect id="b" class="st1" width="10"/>',
  '  <rect id="c" class="st3" fill="blue"/>',
  '  <text id="t1">Sales</text>',
  '  <text id="t2">Order &amp; Header</text>',
  '  <text id="t3">dbo<tspan>Person</tspan></text>',
  '  <text id="t4">a<tspan>b</tspan>c</text>',
  '  <circle id="d"/>',
  '</svg>',
].join('\n');

/** Plan one structural call and apply it on its own, as the client does. */
function run(source: string, tool: string, args: unknown) {
  const { planned, available, reason } = planStructuralEdits(source, tool, args);
  if (!available) return { available, reason, svg: source, outcomes: [] };
  const { svgAfter, outcomes } = applyPlannedBatches(source, [planned]);
  return { available, reason, svg: svgAfter[0] ?? source, outcomes: outcomes[0] ?? [] };
}

describe('isStructuralEditTool', () => {
  it('names the two structural tools and nothing else', () => {
    expect(isStructuralEditTool('set_text')).toBe(true);
    expect(isStructuralEditTool('set_attribute')).toBe(true);
    expect(isStructuralEditTool('replace_lines')).toBe(false);
    expect(isStructuralEditTool('query')).toBe(false);
  });
});

describe('set_text', () => {
  it('replaces the text of one element addressed by id', () => {
    const { svg, outcomes } = run(DOC, 'set_text', { edits: [{ selector: '#t1', text: 'Vertrieb' }] });
    expect(svg).toContain('<text id="t1">Vertrieb</text>');
    expect(outcomes[0]).toMatchObject({ status: 'applied' });
  });

  it('leaves every other element byte-for-byte alone', () => {
    const { svg } = run(DOC, 'set_text', { edits: [{ selector: '#t1', text: 'Vertrieb' }] });
    const before = DOC.split('\n');
    const after = svg.split('\n');
    expect(after.length).toBe(before.length);
    after.forEach((line, i) => {
      if (i !== 5) expect(line).toBe(before[i]);
    });
  });

  it('addresses an element by positional path', () => {
    const { svg, outcomes } = run(DOC, 'set_text', { edits: [{ selector: '/svg[1]/text[1]', text: 'Umsatz' }] });
    expect(outcomes[0]).toMatchObject({ status: 'applied' });
    expect(svg).toContain('<text id="t1">Umsatz</text>');
  });

  it('changes every match of a CSS selector in one edit', () => {
    const { svg, outcomes } = run(DOC, 'set_text', { edits: [{ selector: 'text', text: 'X' }] });
    expect(outcomes[0].status).toBe('applied');
    expect(svg).toContain('<text id="t1">X</text>');
    expect(svg).toContain('<text id="t2">X</text>');
    // #t4's text is in two runs either side of a child, so no single span is
    // "its" text; it is skipped and named rather than guessed at.
    expect(svg).toContain('<text id="t4">a<tspan>b</tspan>c</text>');
    expect(outcomes[0].detail).toMatch(/skipped for having child elements/);
  });

  it('escapes characters that cannot appear literally', () => {
    const { svg } = run(DOC, 'set_text', { edits: [{ selector: '#t1', text: 'A & B < C' }] });
    expect(svg).toContain('<text id="t1">A &amp; B &lt; C</text>');
  });

  it('changes the leading run of an element that also has children, and keeps them', () => {
    // The shape every diagram export produces: <text>label<tspan>…</tspan></text>.
    const { svg, outcomes } = run(DOC, 'set_text', { edits: [{ selector: '#t3', text: 'gone' }] });
    expect(outcomes[0].status).toBe('applied');
    expect(svg).toContain('<text id="t3">gone<tspan>Person</tspan></text>');
  });

  it('refuses one line for a label whose text is split into runs', () => {
    const { svg, outcomes } = run(DOC, 'set_text', { edits: [{ selector: '#t4', text: 'gone' }] });
    expect(outcomes[0].status).toBe('failed');
    // Says how many lines the label has and what they read, so the retry can be
    // the whole rewrite rather than another single-line guess.
    expect(outcomes[0].detail).toMatch(/2-line label/);
    expect(outcomes[0].detail).toMatch(/"a" \/ "bc"/);
    expect(svg).toBe(DOC);
  });

  it('rewrites that same label when given all its lines', () => {
    const { svg, outcomes } = run(DOC, 'set_text', { edits: [{ selector: '#t4', text: 'A\nBC' }] });
    expect(outcomes[0].status).toBe('applied');
    // Including the run that trailed the tspan, which nothing could reach before:
    // it belongs to that tspan's line, and the line is addressable.
    expect(svg).toContain('<text id="t4"><tspan>A</tspan><tspan dy="1.2em">BC</tspan></text>');
  });

  it('refuses a self-closing element, which has no text to replace', () => {
    const { svg, outcomes } = run(DOC, 'set_text', { edits: [{ selector: '#d', text: 'x' }] });
    expect(outcomes[0].status).toBe('failed');
    expect(svg).toBe(DOC);
  });

  it('edits the child of a split element when addressed directly', () => {
    const { svg, outcomes } = run(DOC, 'set_text', { edits: [{ selector: '#t3 tspan', text: 'Person' }] });
    expect(outcomes[0].status).toBe('applied');
    expect(svg).toContain('<tspan>Person</tspan>');
  });

  it('reports an address that matches nothing instead of silently doing nothing', () => {
    const { outcomes } = run(DOC, 'set_text', { edits: [{ selector: '#nope', text: 'x' }] });
    expect(outcomes[0]).toMatchObject({ status: 'failed' });
    expect(outcomes[0].detail).toMatch(/matched no element/);
  });

  it('says what is really there when a guessed path has no such child', () => {
    // The shape a model actually produced: a plausible path onto a node whose
    // children are all <g>. "matched no element" left it guessing the same way
    // twice, so the failure names the node reached and what it holds.
    const { outcomes } = run(DOC, 'set_text', { edits: [{ selector: '/svg[1]/text[99]', text: 'x' }] });
    expect(outcomes[0].status).toBe('failed');
    expect(outcomes[0].detail).toMatch(/\/svg\[1\] has only 4 <text> child\(ren\), so \[99\] is out of range/);
    expect(outcomes[0].detail).toMatch(/Its children are: .*text\[1\.\.4\]/);
  });

  it('names the node reached when the step has no such child at all', () => {
    const { outcomes } = run(DOC, 'set_text', { edits: [{ selector: '/svg[1]/text[1]/g[1]', text: 'x' }] });
    expect(outcomes[0].detail).toMatch(/\/svg\[1\]\/text\[1\] has no <g> child/);
    expect(outcomes[0].detail).toMatch(/no child elements/);
  });

  it('says a path must start at the root when it does not', () => {
    const { outcomes } = run(DOC, 'set_text', { edits: [{ selector: '/g[1]/text[1]', text: 'x' }] });
    expect(outcomes[0].detail).toMatch(/a path must start at \/svg\[1\]/);
  });

  it('tells a mistyped path from a selector, since neither parses', () => {
    const { outcomes } = run(DOC, 'set_text', { edits: [{ selector: 'svg[1]/text[1]', text: 'x' }] });
    expect(outcomes[0].detail).toMatch(/is not a valid CSS selector, and is not a path \(those start with "\/"\)/);
  });

  it('reminds a valid CSS selector that matched nothing which form it was read as', () => {
    const { outcomes } = run(DOC, 'set_text', { edits: [{ selector: '#nope', text: 'x' }] });
    expect(outcomes[0].detail).toMatch(/read as a CSS selector; a positional path has to start with "\/"/);
  });

  it('refuses an edit with no "text" rather than blanking the element', () => {
    const { svg, outcomes } = run(DOC, 'set_text', { edits: [{ selector: '#t1' }] });
    expect(outcomes[0].status).toBe('failed');
    expect(outcomes[0].detail).toMatch(/no "text" given/);
    expect(svg).toBe(DOC);
  });

  it('clears an element when an empty string is given explicitly', () => {
    const { svg, outcomes } = run(DOC, 'set_text', { edits: [{ selector: '#t1', text: '' }] });
    expect(outcomes[0].status).toBe('applied');
    expect(svg).toContain('<text id="t1"></text>');
  });
});

describe('set_attribute', () => {
  it('changes an existing attribute in place', () => {
    const { svg, outcomes } = run(DOC, 'set_attribute', { edits: [{ selector: '#a', name: 'fill', value: 'green' }] });
    expect(outcomes[0]).toMatchObject({ status: 'applied' });
    expect(svg).toContain('<rect id="a" class="st1" fill="green" width="10"/>');
  });

  it('adds an absent attribute without disturbing the others', () => {
    const { svg } = run(DOC, 'set_attribute', { edits: [{ selector: '#b', name: 'fill', value: 'green' }] });
    expect(svg).toContain('<rect id="b" class="st1" width="10" fill="green"/>');
  });

  it('removes an attribute when the value is null', () => {
    const { svg, outcomes } = run(DOC, 'set_attribute', { edits: [{ selector: '#a', name: 'fill', value: null }] });
    expect(outcomes[0]).toMatchObject({ status: 'applied' });
    expect(svg).toContain('<rect id="a" class="st1" width="10"/>');
  });

  it('reaches every element of a class in one edit', () => {
    const { svg, outcomes } = run(DOC, 'set_attribute', { edits: [{ selector: '.st1', name: 'fill', value: 'green' }] });
    expect(outcomes[0]).toMatchObject({ status: 'applied' });
    expect(svg).toContain('<rect id="a" class="st1" fill="green" width="10"/>');
    expect(svg).toContain('<rect id="b" class="st1" width="10" fill="green"/>');
    expect(svg).toContain('<rect id="c" class="st3" fill="blue"/>');
  });

  it('escapes a value that would otherwise close the attribute', () => {
    const { svg } = run(DOC, 'set_attribute', { edits: [{ selector: '#a', name: 'fill', value: 'a"b' }] });
    expect(svg).toContain('fill="a&quot;b"');
  });

  it('warns when a style rule overrides the attribute it just set', () => {
    const { outcomes } = run(DOC, 'set_attribute', { edits: [{ selector: '.st3', name: 'fill', value: 'green' }] });
    expect(outcomes[0].status).toBe('applied');
    expect(outcomes[0].detail).toMatch(/overrides a presentation attribute/);
  });

  it('says nothing about the cascade when no rule sets the property', () => {
    const { outcomes } = run(DOC, 'set_attribute', { edits: [{ selector: '#a', name: 'stroke', value: 'black' }] });
    expect(outcomes[0]).toMatchObject({ status: 'applied', detail: undefined });
  });

  it('labels the outcome with the attribute and the address', () => {
    const { planned } = planStructuralEdits(DOC, 'set_attribute', {
      edits: [{ selector: '#a', name: 'fill', value: 'green' }],
    });
    expect(planned[0].label).toBe('fill on "#a"');
  });
});

describe('structural tools on a document that does not parse', () => {
  const BROKEN = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="a"</svg>';

  it('refuses set_text and says which tool still works', () => {
    const { available, reason } = planStructuralEdits(BROKEN, 'set_text', {
      edits: [{ selector: '#a', text: 'x' }],
    });
    expect(available).toBe(false);
    expect(reason).toMatch(/not valid XML/);
    expect(reason).toMatch(/replace_lines/);
  });

  it('refuses set_attribute the same way', () => {
    const { available, reason } = planStructuralEdits(BROKEN, 'set_attribute', {
      edits: [{ selector: '#a', name: 'fill', value: 'red' }],
    });
    expect(available).toBe(false);
    expect(reason).toMatch(/not valid XML/);
  });
});

describe('line and structural edits planned together', () => {
  it('applies both when they touch different parts of the document', () => {
    const text = planStructuralEdits(DOC, 'set_text', { edits: [{ selector: '#t1', text: 'Vertrieb' }] }).planned;
    const lines = lineEditsToPlanned(DOC, [{ start: 3, end: 3, content: '  <rect id="a" class="st1" fill="pink" width="10"/>' }]);
    const { final, outcomes } = applyPlannedBatches(DOC, [text, lines]);
    expect(outcomes[0][0].status).toBe('applied');
    expect(outcomes[1][0].status).toBe('applied');
    expect(final).toContain('<text id="t1">Vertrieb</text>');
    expect(final).toContain('fill="pink"');
  });

  it('reports a structural edit that lands inside a line another call rewrites', () => {
    // Line 6 IS #t1, so rewriting it and setting its text are contradictory.
    const lines = lineEditsToPlanned(DOC, [{ start: 6, end: 6, content: '  <text id="t1">Umsatz</text>' }]);
    const text = planStructuralEdits(DOC, 'set_text', { edits: [{ selector: '#t1', text: 'Vertrieb' }] }).planned;
    const { final, outcomes } = applyPlannedBatches(DOC, [lines, text]);
    expect(outcomes[0][0].status).toBe('applied');
    expect(outcomes[1][0].status).toBe('conflict');
    expect(outcomes[1][0].detail).toMatch(/overlaps the earlier edit to lines? 6/);
    // Exactly one of them landed — not both compounded.
    expect(final).toContain('<text id="t1">Umsatz</text>');
    expect(final).not.toContain('Vertrieb');
  });

  it('names the losing side by whichever call came first', () => {
    const text = planStructuralEdits(DOC, 'set_text', { edits: [{ selector: '#t1', text: 'Vertrieb' }] }).planned;
    const lines = lineEditsToPlanned(DOC, [{ start: 6, end: 6, content: '  <text id="t1">Umsatz</text>' }]);
    const { outcomes } = applyPlannedBatches(DOC, [text, lines]);
    expect(outcomes[0][0].status).toBe('applied');
    expect(outcomes[1][0].status).toBe('conflict');
    expect(outcomes[1][0].detail).toMatch(/overlaps the earlier edit to text of "#t1"/);
  });

  it('keeps the matches that do not clash when a selector covers several', () => {
    const lines = lineEditsToPlanned(DOC, [{ start: 6, end: 6, content: '  <text id="t1">Umsatz</text>' }]);
    const text = planStructuralEdits(DOC, 'set_text', { edits: [{ selector: 'text', text: 'X' }] }).planned;
    const { final, outcomes } = applyPlannedBatches(DOC, [lines, text]);
    expect(outcomes[1][0].status).toBe('applied');
    expect(outcomes[1][0].detail).toMatch(/1 of 3 target\(s\) overlapped/);
    expect(final).toContain('<text id="t1">Umsatz</text>');
    expect(final).toContain('<text id="t2">X</text>');
  });

  it('says plainly when the model addressed the same element twice', () => {
    // Naming the same selector on both sides of "overlaps" read as a tool bug.
    const a = planStructuralEdits(DOC, 'set_text', { edits: [{ selector: '#t1', text: 'Eins' }] }).planned;
    const b = planStructuralEdits(DOC, 'set_text', { edits: [{ selector: '#t1', text: 'Zwei' }] }).planned;
    const { final, outcomes } = applyPlannedBatches(DOC, [a, b]);
    expect(outcomes[1][0].status).toBe('conflict');
    expect(outcomes[1][0].detail).toMatch(/already changed earlier in this response/);
    expect(outcomes[1][0].detail).not.toMatch(/overlaps/);
    expect(final).toContain('<text id="t1">Eins</text>');
  });

  it('says the same for the partly-clashing case', () => {
    const a = planStructuralEdits(DOC, 'set_text', { edits: [{ selector: '#t1', text: 'Eins' }] }).planned;
    const b = planStructuralEdits(DOC, 'set_text', { edits: [{ selector: 'text', text: 'X' }] }).planned;
    // Relabel the second so both sides carry the same label, as two calls
    // naming the same selector do.
    b[0].label = a[0].label;
    const { outcomes } = applyPlannedBatches(DOC, [a, b]);
    expect(outcomes[1][0].status).toBe('applied');
    expect(outcomes[1][0].detail).toMatch(/already changed earlier in this response/);
  });

  it('shows each call the document as of that call', () => {
    const a = planStructuralEdits(DOC, 'set_text', { edits: [{ selector: '#t1', text: 'Eins' }] }).planned;
    const b = planStructuralEdits(DOC, 'set_text', { edits: [{ selector: '#t2', text: 'Zwei' }] }).planned;
    const { svgAfter } = applyPlannedBatches(DOC, [a, b]);
    expect(svgAfter[0]).toContain('Eins');
    expect(svgAfter[0]).not.toContain('Zwei');
    expect(svgAfter[1]).toContain('Eins');
    expect(svgAfter[1]).toContain('Zwei');
  });
});

describe('two edits setting the same absent attribute', () => {
  // Both are insertions, so they occupy no bytes and cannot overlap. Applying
  // both wrote fill="red" fill="blue" — a duplicate attribute, which stops the
  // document being well-formed XML, reported as two successes.
  const BARE = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="a"/></svg>';

  it('is a contradiction when the attribute is the same', () => {
    const a = planStructuralEdits(BARE, 'set_attribute', { edits: [{ selector: '#a', name: 'fill', value: 'red' }] }).planned;
    const b = planStructuralEdits(BARE, 'set_attribute', { edits: [{ selector: '#a', name: 'fill', value: 'blue' }] }).planned;
    const { final, outcomes } = applyPlannedBatches(BARE, [a, b]);
    expect(outcomes[1][0].status).toBe('conflict');
    expect(final.match(/fill=/g) ?? []).toHaveLength(1);
    expect(final).toContain('fill="red"');
  });

  it('is not a contradiction when the attributes differ', () => {
    const a = planStructuralEdits(BARE, 'set_attribute', { edits: [{ selector: '#a', name: 'fill', value: 'red' }] }).planned;
    const b = planStructuralEdits(BARE, 'set_attribute', { edits: [{ selector: '#a', name: 'stroke', value: 'blue' }] }).planned;
    const { final, outcomes } = applyPlannedBatches(BARE, [a, b]);
    expect(outcomes[1][0].status).toBe('applied');
    expect(final).toContain('fill="red"');
    expect(final).toContain('stroke="blue"');
  });

  it('treats the same attribute in differing case as the same attribute', () => {
    const a = planStructuralEdits(BARE, 'set_attribute', { edits: [{ selector: '#a', name: 'fill', value: 'red' }] }).planned;
    const b = planStructuralEdits(BARE, 'set_attribute', { edits: [{ selector: '#a', name: 'FILL', value: 'blue' }] }).planned;
    const { outcomes } = applyPlannedBatches(BARE, [a, b]);
    expect(outcomes[1][0].status).toBe('conflict');
  });
});

describe('an attribute name that is also regex syntax', () => {
  const SRC = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="a" width="10" xxwidth="99"/></svg>';

  it('does not throw out of the planner and lose the turn', () => {
    expect(() => planStructuralEdits(SRC, 'set_attribute', {
      edits: [{ selector: '#a', name: 'wid(th', value: '5' }],
    })).not.toThrow();
  });

  it('does not let "." stand for any character and hit a neighbour', () => {
    const { svg } = run(SRC, 'set_attribute', { edits: [{ selector: '#a', name: 'x.width', value: '1' }] });
    // "x.width" is absent, so it is added; xxwidth must be left alone.
    expect(svg).toContain('xxwidth="99"');
    expect(svg).toContain('x.width="1"');
  });
});

describe('set_text with a missing "text"', () => {
  const SRC = '<svg xmlns="http://www.w3.org/2000/svg"><text id="p">one</text><text id="q">two</text></svg>';

  it('refuses every such edit, not only the first', () => {
    const { planned } = planStructuralEdits(SRC, 'set_text', { edits: [{ selector: '#p' }, { selector: '#q' }] });
    const { final, outcomes } = applyPlannedBatches(SRC, [planned]);
    expect(outcomes[0].map((o) => o.status)).toEqual(['failed', 'failed']);
    expect(final).toBe(SRC);
  });

  it('still applies the good edits alongside a bad one', () => {
    const { planned } = planStructuralEdits(SRC, 'set_text', {
      edits: [{ selector: '#p' }, { selector: '#q', text: 'zwei' }],
    });
    const { final, outcomes } = applyPlannedBatches(SRC, [planned]);
    expect(outcomes[0].map((o) => o.status)).toEqual(['failed', 'applied']);
    expect(final).toContain('>one<');
    expect(final).toContain('>zwei<');
  });
});

describe('summarizeEdits', () => {
  it('tells the model what an empty call should have carried', () => {
    expect(summarizeEdits([], 'Each edit needs "selector" and "text" inside the "edits" array.'))
      .toMatch(/carried no edits.*"selector" and "text"/);
  });

  it('reports a note on an APPLIED edit, which is the whole point of the check', () => {
    // The cascade warning lands on an edit that succeeded. Reporting only
    // failures dropped it, so a set_attribute that a <style> rule overrides was
    // summarized as a plain success over a drawing that never moved.
    const out = summarizeEdits([
      { label: 'fill on ".st11"', status: 'applied', detail: 'NOTE: also set by CSS (.st11), which overrides a presentation attribute' },
    ], 'hint');
    expect(out).toMatch(/NOTE fill on "\.st11"/);
    expect(out).toMatch(/overrides a presentation attribute/);
  });

  it('carries the cascade note all the way from the planner', () => {
    const styled = '<svg xmlns="http://www.w3.org/2000/svg"><style>.st1 { fill: purple; }</style>'
      + '<rect id="a" class="st1"/></svg>';
    const { planned } = planStructuralEdits(styled, 'set_attribute', {
      edits: [{ selector: '.st1', name: 'fill', value: 'green' }],
    });
    const { outcomes } = applyPlannedBatches(styled, [planned]);
    expect(outcomes[0][0].status).toBe('applied');
    expect(summarizeEdits(outcomes[0], 'hint')).toMatch(/overrides a presentation attribute/);
  });

  it('counts the successes and names each failure', () => {
    const out = summarizeEdits([
      { label: 'text of "#t1"', status: 'applied' },
      { label: 'text of "#nope"', status: 'failed', detail: 'matched no element' },
    ], 'hint');
    expect(out).toMatch(/Applied 1 of 2/);
    expect(out).toMatch(/FAILED text of "#nope": matched no element/);
  });
});
