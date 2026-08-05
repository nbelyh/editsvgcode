import { describe, it, expect } from 'vitest';
import { planStructuralEdits, applyPlannedBatches, lineEditsToPlanned, STRUCTURAL_EDIT_TOOLS, validityRegression } from '../svg-ai';
import { elementExtents, parseSvg } from '../svg-dom';

const DOC = [
  '<svg xmlns="http://www.w3.org/2000/svg">',
  '  <style type="text/css">.st1 {fill:#cdcdcd;stroke:#000000;stroke-width:0.24;}',
  '\t.st2 {font-size:1em;}',
  '\t.st3, .st4 {fill:blue;}',
  '\t.empty {}</style>',
  '  <g id="layer">',
  '    <rect id="a" class="st1"/>',
  '    <text id="t1" class="st2">Sales</text>',
  '  </g>',
  '  <circle id="c" r="5"/>',
  '</svg>',
].join('\n');

function run(source: string, tool: string, args: unknown) {
  const { planned, available, reason } = planStructuralEdits(source, tool, args);
  if (!available) return { available, reason, svg: source, outcomes: [] };
  const { svgAfter, outcomes } = applyPlannedBatches(source, [planned]);
  return { available, reason, svg: svgAfter[0] ?? source, outcomes: outcomes[0] ?? [] };
}

const reparses = (svg: string) => parseSvg(svg) !== null;

describe('elementExtents', () => {
  it('ends a nested element at its own closing tag, not its parent\'s', () => {
    const src = '<svg xmlns="http://www.w3.org/2000/svg"><g><g><rect/></g></g></svg>';
    const doc = parseSvg(src)!;
    const outer = doc.getElementsByTagName('g')[0];
    const inner = doc.getElementsByTagName('g')[1];
    const ex = elementExtents(src, doc);
    expect(src.slice(ex.get(inner)!.start, ex.get(inner)!.end)).toBe('<g><rect/></g>');
    expect(src.slice(ex.get(outer)!.start, ex.get(outer)!.end)).toBe('<g><g><rect/></g></g>');
  });

  it('covers a self-closing element exactly', () => {
    const doc = parseSvg(DOC)!;
    const ex = elementExtents(DOC, doc);
    const circle = doc.getElementById('c')!;
    expect(DOC.slice(ex.get(circle)!.start, ex.get(circle)!.end)).toBe('<circle id="c" r="5"/>');
  });

  it('is not confused by a > inside an attribute value', () => {
    const src = '<svg xmlns="http://www.w3.org/2000/svg"><desc a="x>y">t</desc></svg>';
    const doc = parseSvg(src)!;
    const desc = doc.getElementsByTagName('desc')[0];
    const ex = elementExtents(src, doc);
    expect(src.slice(ex.get(desc)!.start, ex.get(desc)!.end)).toBe('<desc a="x>y">t</desc>');
  });
});

describe('set_style_rule', () => {
  it('changes one declaration and leaves the rest of the rule alone', () => {
    const { svg, outcomes } = run(DOC, 'set_style_rule', {
      edits: [{ selector: '.st1', property: 'fill', value: '#add8e6' }],
    });
    expect(outcomes[0]).toMatchObject({ status: 'applied' });
    expect(svg).toContain('.st1 {fill:#add8e6;stroke:#000000;stroke-width:0.24;}');
  });

  it('adds a declaration the rule does not have yet', () => {
    const { svg, outcomes } = run(DOC, 'set_style_rule', {
      edits: [{ selector: '.st2', property: 'font-weight', value: 'bold' }],
    });
    expect(outcomes[0]).toMatchObject({ status: 'applied' });
    expect(svg).toContain('.st2 {font-weight:bold;font-size:1em;}');
  });

  it('adds without a stray semicolon when the rule is empty', () => {
    const { svg } = run(DOC, 'set_style_rule', {
      edits: [{ selector: '.empty', property: 'fill', value: 'red' }],
    });
    expect(svg).toContain('.empty {fill:red}');
  });

  it('removes a declaration and its separator when the value is null', () => {
    const { svg, outcomes } = run(DOC, 'set_style_rule', {
      edits: [{ selector: '.st1', property: 'stroke', value: null }],
    });
    expect(outcomes[0]).toMatchObject({ status: 'applied' });
    expect(svg).toContain('.st1 {fill:#cdcdcd;stroke-width:0.24;}');
  });

  it('does not mistake stroke-width for stroke', () => {
    const { svg } = run(DOC, 'set_style_rule', {
      edits: [{ selector: '.st1', property: 'stroke-width', value: '2' }],
    });
    expect(svg).toContain('.st1 {fill:#cdcdcd;stroke:#000000;stroke-width:2;}');
  });

  it('matches a selector that shares its rule with another', () => {
    const { svg, outcomes } = run(DOC, 'set_style_rule', {
      edits: [{ selector: '.st4', property: 'fill', value: 'green' }],
    });
    expect(outcomes[0]).toMatchObject({ status: 'applied' });
    expect(svg).toContain('.st3, .st4 {fill:green;}');
  });

  it('lists the real selectors when the one given does not exist', () => {
    const { outcomes, svg } = run(DOC, 'set_style_rule', {
      edits: [{ selector: '.nope', property: 'fill', value: 'red' }],
    });
    expect(outcomes[0].status).toBe('failed');
    expect(outcomes[0].detail).toMatch(/no rule has the selector "\.nope"/);
    expect(outcomes[0].detail).toMatch(/\.st1/);
    expect(svg).toBe(DOC);
  });

  it('says to use set_attribute when there is no style block at all', () => {
    const bare = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="a"/></svg>';
    const { outcomes } = run(bare, 'set_style_rule', {
      edits: [{ selector: '.st1', property: 'fill', value: 'red' }],
    });
    expect(outcomes[0].detail).toMatch(/no <style> rules.*set_attribute/);
  });

  it('reports a property the rule never declared instead of removing nothing', () => {
    const { outcomes } = run(DOC, 'set_style_rule', {
      edits: [{ selector: '.st2', property: 'fill', value: null }],
    });
    expect(outcomes[0].status).toBe('failed');
    expect(outcomes[0].detail).toMatch(/no "fill" declaration to remove/);
  });

  it('refuses a value that would end the rule early', () => {
    for (const value of ['red}', 'red;stroke:blue', 'a{b']) {
      const { outcomes, svg } = run(DOC, 'set_style_rule', {
        edits: [{ selector: '.st1', property: 'fill', value }],
      });
      expect(outcomes[0].status).toBe('failed');
      expect(svg).toBe(DOC);
    }
  });

  it('leaves the document parseable', () => {
    const { svg } = run(DOC, 'set_style_rule', {
      edits: [
        { selector: '.st1', property: 'fill', value: 'red' },
        { selector: '.st2', property: 'font-size', value: '2em' },
      ],
    });
    expect(reparses(svg)).toBe(true);
  });
});

describe('remove_element', () => {
  it('removes an element with its children and its whole line', () => {
    const { svg, outcomes } = run(DOC, 'remove_element', { edits: [{ selector: '#layer' }] });
    expect(outcomes[0]).toMatchObject({ status: 'applied' });
    expect(svg).not.toContain('<g id="layer">');
    expect(svg).not.toContain('<rect id="a"');
    expect(svg).not.toContain('Sales');
    expect(svg).toContain('<circle id="c" r="5"/>');
    expect(reparses(svg)).toBe(true);
  });

  it('leaves no blank line behind', () => {
    const { svg } = run(DOC, 'remove_element', { edits: [{ selector: '#c' }] });
    expect(svg.split('\n').filter((l) => l.trim() === '')).toHaveLength(0);
  });

  it('removes every match of a selector', () => {
    const { svg, outcomes } = run(DOC, 'remove_element', { edits: [{ selector: 'rect, circle' }] });
    expect(outcomes[0].detail).toMatch(/removed all 2 matching elements/);
    expect(svg).not.toContain('<rect');
    expect(svg).not.toContain('<circle');
    expect(reparses(svg)).toBe(true);
  });

  it('refuses to remove the root', () => {
    const { svg, outcomes } = run(DOC, 'remove_element', { edits: [{ selector: 'svg' }] });
    expect(outcomes[0].status).toBe('failed');
    expect(outcomes[0].detail).toMatch(/removing it would leave no document/);
    expect(svg).toBe(DOC);
  });

  it('explains an address that matches nothing', () => {
    const { outcomes } = run(DOC, 'remove_element', { edits: [{ selector: '/svg[1]/g[9]' }] });
    expect(outcomes[0].status).toBe('failed');
    expect(outcomes[0].detail).toMatch(/matched no element/);
  });
});

describe('insert_element', () => {
  it('inserts after an element', () => {
    const { svg, outcomes } = run(DOC, 'insert_element', {
      edits: [{ selector: '#c', position: 'after', svg: '<rect id="new" width="1"/>' }],
    });
    expect(outcomes[0]).toMatchObject({ status: 'applied' });
    expect(svg).toMatch(/<circle id="c" r="5"\/>\n\s*<rect id="new" width="1"\/>/);
    expect(reparses(svg)).toBe(true);
  });

  it('inserts before an element', () => {
    const { svg } = run(DOC, 'insert_element', {
      edits: [{ selector: '#c', position: 'before', svg: '<rect id="new"/>' }],
    });
    expect(svg).toMatch(/<rect id="new"\/>\n\s*<circle id="c"/);
    expect(reparses(svg)).toBe(true);
  });

  it('inserts as a first and as a last child', () => {
    const first = run(DOC, 'insert_element', {
      edits: [{ selector: '#layer', position: 'first-child', svg: '<rect id="f"/>' }],
    });
    expect(first.svg).toMatch(/<g id="layer">\s*<rect id="f"\/>/);
    expect(reparses(first.svg)).toBe(true);

    const last = run(DOC, 'insert_element', {
      edits: [{ selector: '#layer', position: 'last-child', svg: '<rect id="l"/>' }],
    });
    expect(last.svg).toMatch(/<rect id="l"\/>\n\s*<\/g>/);
    expect(reparses(last.svg)).toBe(true);
  });

  it('refuses to put a child inside a self-closing element', () => {
    const { svg, outcomes } = run(DOC, 'insert_element', {
      edits: [{ selector: '#c', position: 'first-child', svg: '<rect/>' }],
    });
    expect(outcomes[0].status).toBe('failed');
    expect(outcomes[0].detail).toMatch(/self-closing element has no inside/);
    expect(svg).toBe(DOC);
  });

  it('refuses markup that is not well-formed rather than breaking the document', () => {
    const { svg, outcomes } = run(DOC, 'insert_element', {
      edits: [{ selector: '#c', position: 'after', svg: '<rect id="new"' }],
    });
    expect(outcomes[0].status).toBe('failed');
    expect(outcomes[0].detail).toMatch(/not well-formed/);
    expect(svg).toBe(DOC);
    expect(reparses(svg)).toBe(true);
  });

  it('accepts a fragment of several siblings', () => {
    const { svg, outcomes } = run(DOC, 'insert_element', {
      edits: [{ selector: '#c', position: 'after', svg: '<rect id="p"/><rect id="q"/>' }],
    });
    expect(outcomes[0].status).toBe('applied');
    expect(svg).toContain('<rect id="p"/><rect id="q"/>');
    expect(reparses(svg)).toBe(true);
  });

  it('rejects a position it does not recognise instead of guessing', () => {
    const { svg, outcomes } = run(DOC, 'insert_element', {
      edits: [{ selector: '#c', position: 'inside', svg: '<rect/>' }],
    });
    expect(outcomes[0].status).toBe('failed');
    expect(outcomes[0].detail).toMatch(/not a position/);
    expect(svg).toBe(DOC);
  });

  it('inserts beside every match, keeping both copies', () => {
    const { svg, outcomes } = run(DOC, 'insert_element', {
      edits: [{ selector: 'rect, circle', position: 'after', svg: '<desc>x</desc>' }],
    });
    expect(outcomes[0].detail).toMatch(/inserted beside all 2 matching elements/);
    expect((svg.match(/<desc>x<\/desc>/g) || []).length).toBe(2);
    expect(reparses(svg)).toBe(true);
  });
});

describe('the new tools alongside the old ones', () => {
  it('plans a rule change, an insert and a removal in one response', () => {
    const a = planStructuralEdits(DOC, 'set_style_rule', { edits: [{ selector: '.st1', property: 'fill', value: 'red' }] }).planned;
    const b = planStructuralEdits(DOC, 'insert_element', { edits: [{ selector: '#c', position: 'after', svg: '<rect id="n"/>' }] }).planned;
    const c = planStructuralEdits(DOC, 'remove_element', { edits: [{ selector: '#a' }] }).planned;
    const { final, outcomes } = applyPlannedBatches(DOC, [a, b, c]);
    expect(outcomes.flat().every((o) => o.status === 'applied')).toBe(true);
    expect(final).toContain('fill:red');
    expect(final).toContain('<rect id="n"/>');
    expect(final).not.toContain('<rect id="a"');
    expect(reparses(final)).toBe(true);
  });

  it('reports an insert into an element another call is removing', () => {
    const remove = planStructuralEdits(DOC, 'remove_element', { edits: [{ selector: '#layer' }] }).planned;
    const insert = planStructuralEdits(DOC, 'insert_element', {
      edits: [{ selector: '#layer', position: 'last-child', svg: '<rect id="n"/>' }],
    }).planned;
    const { final, outcomes } = applyPlannedBatches(DOC, [remove, insert]);
    expect(outcomes[0][0].status).toBe('applied');
    expect(outcomes[1][0].status).toBe('conflict');
    expect(final).not.toContain('<rect id="n"/>');
    expect(reparses(final)).toBe(true);
  });

  it('reports a rule change that collides with a line edit to the same block', () => {
    const lines = lineEditsToPlanned(DOC, [{ start: 2, end: 2, content: '  <style type="text/css">.st1 {fill:green;}' }]);
    const rule = planStructuralEdits(DOC, 'set_style_rule', { edits: [{ selector: '.st1', property: 'fill', value: 'red' }] }).planned;
    const { outcomes } = applyPlannedBatches(DOC, [lines, rule]);
    expect(outcomes[0][0].status).toBe('applied');
    expect(outcomes[1][0].status).toBe('conflict');
  });

  it('refuses all three while the document does not parse', () => {
    const broken = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="a"</svg>';
    for (const [tool, args] of [
      ['set_style_rule', { edits: [{ selector: '.st1', property: 'fill', value: 'red' }] }],
      ['insert_element', { edits: [{ selector: '#a', position: 'after', svg: '<rect/>' }] }],
      ['remove_element', { edits: [{ selector: '#a' }] }],
    ] as const) {
      const { available, reason } = planStructuralEdits(broken, tool, args);
      expect(available).toBe(false);
      expect(reason).toMatch(/not valid XML/);
      expect(reason).toMatch(/replace_lines/);
    }
  });
});

describe('the validity guard', () => {
  // A half-typed document is an ordinary state in an editor. Structural
  // addressing needs a strict parse, and the lenient parser silently
  // restructures broken markup — offsets taken from a restructured tree point
  // at the wrong bytes. Refusing is recoverable; editing the wrong element is
  // not. Every structural tool must therefore refuse, not just the ones that
  // happened to be tested when they were written.
  const BROKEN = [
    '<svg xmlns="http://www.w3.org/2000/svg"><rect id="a"</svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><g><rect/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><g></svg></g>',
    '',
    '<',
  ];

  const CALLS: Array<[string, unknown]> = [
    ['set_text', { edits: [{ selector: '#a', text: 'x' }] }],
    ['set_attribute', { edits: [{ selector: '#a', name: 'fill', value: 'red' }] }],
    ['set_style_rule', { edits: [{ selector: '.st1', property: 'fill', value: 'red' }] }],
    ['insert_element', { edits: [{ selector: '#a', position: 'after', svg: '<rect/>' }] }],
    ['remove_element', { edits: [{ selector: '#a' }] }],
  ];

  it('every structural tool refuses every malformed document', () => {
    for (const source of BROKEN) {
      for (const [tool, args] of CALLS) {
        const { planned, available, reason } = planStructuralEdits(source, tool, args);
        expect({ source, tool, available, planned: planned.length })
          .toEqual({ source, tool, available: false, planned: 0 });
        expect(reason).toBeTruthy();
      }
    }
  });

  it('points at the tool that still works', () => {
    for (const [tool, args] of CALLS) {
      const { reason } = planStructuralEdits(BROKEN[0], tool, args);
      expect(reason).toMatch(/replace_lines/);
    }
  });

  it('a refusal yields no ranges at all, so nothing can leak into the apply pass', () => {
    for (const [tool, args] of CALLS) {
      const { planned } = planStructuralEdits(BROKEN[0], tool, args);
      expect(planned.flatMap((p) => p.ranges)).toEqual([]);
    }
  });

  it('every structural tool is covered by this test', () => {
    expect(CALLS.map(([t]) => t).sort()).toEqual([...STRUCTURAL_EDIT_TOOLS].sort());
  });
});

describe('validityRegression — the guard on the way out', () => {
  const GOOD = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="a"/></svg>';
  const BAD = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="a"</svg>';

  it('reports a change that broke a document which parsed before', () => {
    const msg = validityRegression(GOOD, BAD);
    expect(msg).toMatch(/parsed before this change and does not parse after it/);
    expect(msg).toMatch(/do not re-issue the same call/);
  });

  it('stays quiet when the document was already broken', () => {
    // The user is mid-keystroke. Blaming the edit would cry wolf every turn
    // until they finish typing.
    expect(validityRegression(BAD, BAD)).toBeNull();
    expect(validityRegression(BAD, '<svg><g></svg>')).toBeNull();
  });

  it('stays quiet on a change that repaired the document', () => {
    expect(validityRegression(BAD, GOOD)).toBeNull();
  });

  it('stays quiet when nothing broke', () => {
    expect(validityRegression(GOOD, GOOD)).toBeNull();
    expect(validityRegression(GOOD, '<svg xmlns="http://www.w3.org/2000/svg"><rect id="b"/></svg>')).toBeNull();
  });

  it('catches the line edit that strands a closing tag', () => {
    // The realistic shape: replace_lines is told to change a label and drops
    // the tag around it. Every structural tool is safe here by construction;
    // this is the hole they do not cover.
    const before = ['<svg xmlns="http://www.w3.org/2000/svg">', '  <g>', '    <text>a</text>', '  </g>', '</svg>'].join('\n');
    const { svgAfter } = applyPlannedBatches(before, [
      lineEditsToPlanned(before, [{ start: 3, end: 3, content: '    <text>a</text' }]),
    ]);
    expect(validityRegression(before, svgAfter[0])).toMatch(/does not parse after it/);
  });

  it('says nothing about a structural edit, which cannot produce one', () => {
    const before = ['<svg xmlns="http://www.w3.org/2000/svg">', '  <text id="t">a &amp; b</text>', '</svg>'].join('\n');
    for (const [tool, args] of [
      ['set_text', { edits: [{ selector: '#t', text: 'x < y & z' }] }],
      ['set_attribute', { edits: [{ selector: '#t', name: 'data-x', value: 'a"b<c' }] }],
      ['remove_element', { edits: [{ selector: '#t' }] }],
      ['insert_element', { edits: [{ selector: '#t', position: 'after', svg: '<desc>d</desc>' }] }],
    ] as const) {
      const { planned } = planStructuralEdits(before, tool, args);
      const { svgAfter } = applyPlannedBatches(before, [planned]);
      expect({ tool, broke: validityRegression(before, svgAfter[0]) }).toEqual({ tool, broke: null });
    }
  });
});
