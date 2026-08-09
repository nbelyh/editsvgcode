import { describe, it, expect } from 'vitest';
import {
  validateSvg, parseSvg, resolveSelector, isSelectorError, resolveWithin,
  startTagRanges, elementSourceRanges, describeMatches, pathOf,
  directText, textRangeOf, escapeText, planTextEdits, planAttributeEdits,
} from '../svg-dom';

const DOC = [
  '<svg xmlns="http://www.w3.org/2000/svg">',
  '  <g id="layer" class="st1">',
  '    <rect id="a" class="st1"/>',
  '    <rect id="b" class="st2"/>',
  '    <text>dbo<tspan>x</tspan></text>',
  '  </g>',
  '</svg>',
].join('\n');

const parse = (s: string) => {
  const doc = parseSvg(s);
  if (!doc) throw new Error('expected a valid document');
  return doc;
};

describe('validateSvg — decides whether structural tools are available', () => {
  it('accepts a well-formed document', () => {
    const v = validateSvg(DOC);
    expect(v.valid).toBe(true);
    expect(v.doc?.documentElement.tagName.toLowerCase()).toBe('svg');
  });

  it('rejects a half-typed document and says why', () => {
    const v = validateSvg('<svg><g><rect fill="red"');
    expect(v.valid).toBe(false);
    expect(v.message).toBeTruthy();
  });

  it('rejects mismatched nesting', () => {
    expect(validateSvg('<svg><g></svg></g>').valid).toBe(false);
  });

  it('rejects an empty document', () => {
    expect(validateSvg('   ').valid).toBe(false);
  });

  it('never throws', () => {
    for (const s of ['', '<', '<<<<', '<svg', '</g>', 'plain text']) {
      expect(() => validateSvg(s)).not.toThrow();
    }
  });
});

describe('resolveSelector — one vocabulary for every tool', () => {
  it('resolves a positional path to exactly one element', () => {
    const doc = parse(DOC);
    const found = resolveSelector(doc, '/svg[1]/g[1]/rect[2]');
    expect(isSelectorError(found)).toBe(false);
    expect((found as Element[]).map((e) => e.getAttribute('id'))).toEqual(['b']);
  });

  it('resolves the root by path', () => {
    const found = resolveSelector(parse(DOC), '/svg[1]') as Element[];
    expect(found).toHaveLength(1);
    expect(found[0].tagName.toLowerCase()).toBe('svg');
  });

  it('treats a bare step as the first of its kind', () => {
    const found = resolveSelector(parse(DOC), '/svg/g/rect') as Element[];
    expect(found.map((e) => e.getAttribute('id'))).toEqual(['a']);
  });

  it('returns nothing for a path that does not exist', () => {
    expect(resolveSelector(parse(DOC), '/svg[1]/g[1]/rect[9]')).toEqual([]);
    expect(resolveSelector(parse(DOC), '/svg[1]/circle[1]')).toEqual([]);
  });

  it('resolves a CSS selector to a set', () => {
    const found = resolveSelector(parse(DOC), '.st1') as Element[];
    expect(found.map((e) => e.tagName.toLowerCase())).toEqual(['g', 'rect']);
  });

  it('resolves an id and a tag', () => {
    expect((resolveSelector(parse(DOC), '#b') as Element[])[0].getAttribute('id')).toBe('b');
    expect((resolveSelector(parse(DOC), 'rect') as Element[])).toHaveLength(2);
  });

  it('reports a malformed CSS selector instead of guessing', () => {
    const r = resolveSelector(parse(DOC), 'rect[[[');
    expect(isSelectorError(r)).toBe(true);
    expect((r as { error: string }).error).toMatch(/not a valid CSS selector/);
  });

  it('an address matching nothing is not an error', () => {
    expect(resolveSelector(parse(DOC), '.nosuchclass')).toEqual([]);
  });
});

describe('pathOf — round-trips with resolveSelector', () => {
  it('produces a path that resolves back to the same element', () => {
    const doc = parse(DOC);
    for (const el of Array.from(doc.querySelectorAll('*'))) {
      const back = resolveSelector(doc, pathOf(el)) as Element[];
      expect(back).toHaveLength(1);
      expect(back[0]).toBe(el);
    }
  });
});

describe('elementSourceRanges — DOM node back to the bytes that made it', () => {
  it('maps every element to its start tag', () => {
    const doc = parse(DOC);
    const ranges = elementSourceRanges(DOC, doc);
    const rectB = doc.querySelector('#b')!;
    const tag = ranges.get(rectB)!;
    expect(DOC.slice(tag.start, tag.end)).toBe('<rect id="b" class="st2"/>');
  });

  it('marks self-closing tags', () => {
    const doc = parse(DOC);
    const ranges = elementSourceRanges(DOC, doc);
    expect(ranges.get(doc.querySelector('#a')!)!.selfClosing).toBe(true);
    expect(ranges.get(doc.querySelector('#layer')!)!.selfClosing).toBe(false);
  });

  it('is not fooled by a ">" inside an attribute value', () => {
    const src = '<svg><rect data-note="a > b" id="x"/></svg>';
    const doc = parse(src);
    const tag = elementSourceRanges(src, doc).get(doc.querySelector('#x')!)!;
    expect(src.slice(tag.start, tag.end)).toBe('<rect data-note="a > b" id="x"/>');
  });

  it('skips comments, CDATA and processing instructions', () => {
    const src = '<?xml version="1.0"?><!-- <rect/> --><svg><![CDATA[<rect/>]]><rect id="x"/></svg>';
    expect(startTagRanges(src).map((t) => t.name)).toEqual(['svg', 'rect']);
  });
});

describe('describeMatches — what actually matched, with somewhere to go', () => {
  it('reports identity and source line for each match', () => {
    const doc = parse(DOC);
    const found = resolveSelector(doc, '.st1') as Element[];
    const [group, rect] = describeMatches(DOC, doc, found);
    expect(group).toMatchObject({ path: '/svg[1]/g[1]', tag: 'g', id: 'layer', className: 'st1', line: 2 });
    // An element carrying its own id needs nothing else to name it.
    expect(rect).toEqual({ path: '/svg[1]/g[1]/rect[1]', address: '#a', tag: 'rect', id: 'a', className: 'st1', line: 3 });
  });

  it('tells a container where the text under it lives', () => {
    // Asking for a group and getting back only the group's own path is a dead
    // end: set_text refuses a group, and the model has nowhere else to go. This
    // is what burned a whole turn on a rename.
    const doc = parse(DOC);
    const [group] = describeMatches(DOC, doc, [doc.querySelector('#layer')!]);
    expect(group.text).toBeUndefined();
    // Anchored on the nearest id rather than spelled out positionally: these are
    // handed back to be copied into the next call, and a path of look-alike
    // steps is what gets miscopied.
    expect(group.textIn).toEqual([
      { path: '#layer text', text: 'dbo' },
      { path: '#layer tspan', text: 'x' },
    ]);
  });

  it('falls back to the path when no id isolates the element', () => {
    // Two texts under one id'd group: "#g text" would name both, so it is not an
    // address for either and the positional path stands.
    const src = '<svg xmlns="http://www.w3.org/2000/svg"><g id="pair"><text>one</text><text>two</text></g></svg>';
    const doc = parse(src);
    const [first] = describeMatches(src, doc, [doc.querySelectorAll('text')[0]]);
    expect(first.address).toBeUndefined();
    expect(first.path).toBe('/svg[1]/g[1]/text[1]');
  });

  it('anchors on the nearest id when the element has none of its own', () => {
    // The shape this exists for: /svg[1]/g[1]/g[1]/g[402]/g[1]/g[6]/text[1] has
    // three g[1]s, and the step that got dropped in a real run was one of them.
    const src = '<svg xmlns="http://www.w3.org/2000/svg"><g><g><g id="shape2150-4244"><text>V</text></g></g></g></svg>';
    const doc = parse(src);
    const [t] = describeMatches(src, doc, [doc.querySelector('text')!]);
    expect(t.address).toBe('#shape2150-4244 text');
  });

  it('says nothing about descendants when the node has its own text', () => {
    const src = '<svg xmlns="http://www.w3.org/2000/svg"><text>a</text></svg>';
    const doc = parse(src);
    const [t] = describeMatches(src, doc, [doc.querySelector('text')!]);
    expect(t.text).toBe('a');
    expect(t.textIn).toBeUndefined();
  });

  it('offers only paths set_text will actually accept', () => {
    // A node whose text is in two runs either side of a child cannot be
    // addressed, so pointing at it would be another dead end.
    const src = '<svg xmlns="http://www.w3.org/2000/svg"><g><text>a<tspan>b</tspan>c</text></g></svg>';
    const doc = parse(src);
    const [g] = describeMatches(src, doc, [doc.querySelector('g')!]);
    expect(g.textIn).toEqual([{ path: '/svg[1]/g[1]/text[1]/tspan[1]', text: 'b' }]);
  });

  it('describes a multi-line label as its lines, not as settable text', () => {
    // The legend label from a Visio floor plan. This used to report text="ac" —
    // so the model addressed the <text> it was shown, and set_text refused it,
    // identically, every turn. Now it reads as the two lines it renders as, and
    // that address takes them back.
    const src = '<svg xmlns="http://www.w3.org/2000/svg"><text>a<tspan>b</tspan>c</text></svg>';
    const doc = parse(src);
    const [t] = describeMatches(src, doc, [doc.querySelector('text')!]);
    expect(t.text).toBeUndefined();
    expect(t.blockLines).toEqual(['a', 'bc']);
  });

  it('reports both the settable run and the lines, on the common export shape', () => {
    // One leading run then tspans — the shape most of a Visio export uses.
    // set_text handles the run, so query must keep offering text=; but it is
    // also a two-line label, and saying only text= meant a one-line edit
    // rewrote the first line and reported success with nothing else mentioned.
    const src = '<svg xmlns="http://www.w3.org/2000/svg"><text>Gross Area<tspan>545</tspan></text></svg>';
    const doc = parse(src);
    const [t] = describeMatches(src, doc, [doc.querySelector('text')!]);
    expect(t.text).toBe('Gross Area');
    expect(t.blockLines).toEqual(['Gross Area', '545']);
  });

  it('includes elements a bounds query would drop', () => {
    // <defs> content and gradients never render, so a geometry-based query
    // silently undercounts what an edit would actually change.
    const src = '<svg><defs><linearGradient id="g1" class="st1"/></defs><rect class="st1"/></svg>';
    const doc = parse(src);
    const found = resolveSelector(doc, '.st1') as Element[];
    expect(describeMatches(src, doc, found).map((m) => m.tag)).toEqual(['lineargradient', 'rect']);
  });
});

describe('directText — a node owns only its own characters', () => {
  it('excludes descendant text', () => {
    // textContent would be "PKAddressID"; writing that back would delete the tspan.
    const doc = parse('<svg><text>PK<tspan>AddressID</tspan></text></svg>');
    expect(directText(doc.querySelector('text')!)).toBe('PK');
    expect(directText(doc.querySelector('tspan')!)).toBe('AddressID');
  });

  it('is empty for an element with no character data', () => {
    const doc = parse('<svg><g><rect/></g></svg>');
    expect(directText(doc.querySelector('g')!)).toBe('');
  });

  it('every piece of visible text belongs to exactly one address', () => {
    const src = '<svg><text>a<tspan>b</tspan>c<tspan>d</tspan></text></svg>';
    const doc = parse(src);
    const all = Array.from(doc.querySelectorAll('text, tspan')).map((e) => directText(e));
    expect(all).toEqual(['ac', 'b', 'd']);
  });
});

describe('query reports text', () => {
  it('includes each node\'s own text', () => {
    const src = '<svg><text>dbo</text></svg>';
    const doc = parse(src);
    const found = resolveSelector(doc, 'text') as Element[];
    expect(describeMatches(src, doc, found)[0].text).toBe('dbo');
  });

  it('omits whitespace-only content', () => {
    const src = '<svg><g>\n  </g></svg>';
    const doc = parse(src);
    expect(describeMatches(src, doc, [doc.querySelector('g')!])[0].text).toBeUndefined();
  });
});

describe('textRangeOf — where a node\'s text lives in the source', () => {
  it('finds the exact range of a leaf node\'s text', () => {
    const src = '<svg><text x="4">dbo</text></svg>';
    const doc = parse(src);
    const r = textRangeOf(src, doc, doc.querySelector('text')!)!;
    expect(src.slice(r.start, r.end)).toBe('dbo');
    expect(r.current).toBe('dbo');
  });

  it('rewrites only that range, leaving markup untouched', () => {
    const src = '<svg>\n  <text x="4" class="st2">dbo</text>\n</svg>';
    const doc = parse(src);
    const r = textRangeOf(src, doc, doc.querySelector('text')!)!;
    const out = src.slice(0, r.start) + escapeText('Verkauf') + src.slice(r.end);
    expect(out).toBe('<svg>\n  <text x="4" class="st2">Verkauf</text>\n</svg>');
  });

  it('addresses a tspan independently of its parent', () => {
    const src = '<svg><text>PK<tspan>AddressID</tspan></text></svg>';
    const doc = parse(src);
    const r = textRangeOf(src, doc, doc.querySelector('tspan')!)!;
    expect(src.slice(r.start, r.end)).toBe('AddressID');
  });

  it('accepts a leading run before children, which is contiguous', () => {
    const src = '<svg><text>PK<tspan>x</tspan></text></svg>';
    const doc = parse(src);
    const r = textRangeOf(src, doc, doc.querySelector('text')!)!;
    expect(src.slice(r.start, r.end)).toBe('PK');
  });

  it('refuses two separate runs, where no single span holds the text', () => {
    const src = '<svg><text>a<tspan>b</tspan>c</text></svg>';
    const doc = parse(src);
    expect(textRangeOf(src, doc, doc.querySelector('text')!)).toBeNull();
  });

  it('refuses a self-closing element', () => {
    const src = '<svg><rect/></svg>';
    const doc = parse(src);
    expect(textRangeOf(src, doc, doc.querySelector('rect')!)).toBeNull();
  });

  it('escapes characters that cannot appear literally', () => {
    expect(escapeText('a & b < c > d')).toBe('a &amp; b &lt; c &gt; d');
  });

  it('round-trips an entity through read and write', () => {
    const src = '<svg><text>Tom &amp; Jerry</text></svg>';
    const doc = parse(src);
    const el = doc.querySelector('text')!;
    expect(directText(el)).toBe('Tom & Jerry');
    const r = textRangeOf(src, doc, el)!;
    const out = src.slice(0, r.start) + escapeText('Tom & Jerry & Co') + src.slice(r.end);
    expect(out).toBe('<svg><text>Tom &amp; Jerry &amp; Co</text></svg>');
  });
});

describe('planTextEdits — resolves against one snapshot, applies nothing', () => {
  const apply = (src: string, ranges: { start: number; end: number; replacement: string }[]) => {
    let out = src;
    for (const r of [...ranges].sort((a, b) => b.start - a.start)) {
      out = out.slice(0, r.start) + r.replacement + out.slice(r.end);
    }
    return out;
  };

  it('changes one node addressed by path', () => {
    const src = '<svg><g><text>dbo</text></g></svg>';
    const { ranges, outcomes } = planTextEdits(src, [{ selector: '/svg[1]/g[1]/text[1]', text: 'Verkauf' }]);
    expect(outcomes[0]).toMatchObject({ status: 'applied', matched: 1 });
    expect(apply(src, ranges)).toBe('<svg><g><text>Verkauf</text></g></svg>');
  });

  it('changes every match of a CSS selector', () => {
    const src = '<svg><text class="lbl">a</text><text class="lbl">b</text></svg>';
    const { ranges, outcomes } = planTextEdits(src, [{ selector: '.lbl', text: 'X' }]);
    expect(outcomes[0].matched).toBe(2);
    expect(apply(src, ranges)).toBe('<svg><text class="lbl">X</text><text class="lbl">X</text></svg>');
  });

  it('leaves surrounding markup and identifiers untouched', () => {
    // The failure that started all of this: relabelling must not reach ids.
    const src = '<svg><g id="SalesOrderHeader"><text>Sales</text></g></svg>';
    const { ranges } = planTextEdits(src, [{ selector: '/svg[1]/g[1]/text[1]', text: 'Verkauf' }]);
    const out = apply(src, ranges);
    expect(out).toBe('<svg><g id="SalesOrderHeader"><text>Verkauf</text></g></svg>');
    expect(out).toContain('id="SalesOrderHeader"');
  });

  it('applies several edits without offsets drifting', () => {
    const src = '<svg><text>one</text><text>two</text><text>three</text></svg>';
    const { ranges } = planTextEdits(src, [
      { selector: '/svg[1]/text[1]', text: 'a much longer replacement' },
      { selector: '/svg[1]/text[2]', text: 'x' },
      { selector: '/svg[1]/text[3]', text: 'another long one' },
    ]);
    expect(apply(src, ranges)).toBe('<svg><text>a much longer replacement</text><text>x</text><text>another long one</text></svg>');
  });

  it('translates a tspan without touching its parent', () => {
    const src = '<svg><text>PK<tspan>AddressID</tspan></text></svg>';
    const { ranges } = planTextEdits(src, [{ selector: '/svg[1]/text[1]/tspan[1]', text: 'AdressID' }]);
    expect(apply(src, ranges)).toBe('<svg><text>PK<tspan>AdressID</tspan></text></svg>');
  });

  it('escapes characters that cannot appear literally', () => {
    const src = '<svg><text>x</text></svg>';
    const { ranges } = planTextEdits(src, [{ selector: 'text', text: 'a & b' }]);
    expect(apply(src, ranges)).toBe('<svg><text>a &amp; b</text></svg>');
  });

  it('refuses one line for a multi-line label, and says how to write it', () => {
    // "c" continues the tspan's line rather than starting one — measured in a
    // browser — so this label reads two lines, "a" and "bc", not three.
    const src = '<svg><text>a<tspan>b</tspan>c</text></svg>';
    const { ranges, outcomes } = planTextEdits(src, [{ selector: '/svg[1]/text[1]', text: 'nope' }]);
    expect(ranges).toEqual([]);
    expect(outcomes[0].status).toBe('failed');
    expect(outcomes[0].detail).toMatch(/2-line label/);
    expect(outcomes[0].detail).toMatch(/"a" \/ "bc"/);
    expect(outcomes[0].detail).not.toMatch(/Address the children instead/);
  });

  it('rewrites a whole multi-line label, every line a tspan', () => {
    // The Visio shape: first line bare, the rest tspans carrying x and dy. Each
    // line keeps the geometry of the line it replaces, so the block does not move.
    const src = '<svg><text x="10" y="5">a<tspan x="7" dy="1.2em" class="st5">b</tspan></text></svg>';
    const { ranges, outcomes } = planTextEdits(src, [{ selector: '/svg[1]/text[1]', text: 'A\nB' }]);
    expect(outcomes[0].status).toBe('applied');
    expect(apply(src, ranges)).toBe(
      '<svg><text x="10" y="5"><tspan x="10">A</tspan><tspan x="7" dy="1.2em" class="st5">B</tspan></text></svg>'
    );
  });

  it('folds a run trailing a tspan into that tspan\'s line', () => {
    // The legend case: "Non" and "-Movable Furnishings" render as one line, and
    // the trailing run had no address of its own. Rewriting the line reaches it.
    const src = '<svg><text x="10" y="5">a<tspan x="7" dy="1.2em">Non</tspan>-Movable Furnishings</text></svg>';
    const { ranges, outcomes } = planTextEdits(src, [{ selector: '/svg[1]/text[1]', text: 'A\nNicht-Bewegliche Ausstattung' }]);
    expect(outcomes[0].status).toBe('applied');
    expect(apply(src, ranges)).toBe(
      '<svg><text x="10" y="5"><tspan x="10">A</tspan><tspan x="7" dy="1.2em">Nicht-Bewegliche Ausstattung</tspan></text></svg>'
    );
  });

  it('keeps the lines a short rewrite leaves out', () => {
    // Observed: a room label of "L. Wkstn / W.27 / 6 sq m" came back as two
    // lines, because the area needs no translating and the model omits what it
    // is not changing. Taking that at face value would have dropped the area
    // from forty-odd labels; refusing it lost the whole edit. Keep the rest.
    const src = '<svg><text x="1" y="2">L. Wkstn<tspan x="3" dy="1.2em">W.27</tspan><tspan x="4" dy="1.2em">6 sq m</tspan></text></svg>';
    const { ranges, outcomes } = planTextEdits(src, [{ selector: '/svg[1]/text[1]', text: 'Gr. Arbpl.\nW.27' }]);
    expect(outcomes[0].status).toBe('applied');
    expect(apply(src, ranges)).toBe(
      '<svg><text x="1" y="2"><tspan x="1">Gr. Arbpl.</tspan><tspan x="3" dy="1.2em">W.27</tspan><tspan x="4" dy="1.2em">6 sq m</tspan></text></svg>'
    );
    // Not silent: a missing line is usually deliberate and occasionally a slip.
    expect(outcomes[0].detail).toMatch(/1 of 3 line\(s\) left unchanged/);
  });

  it('accepts more lines than the label had, re-wrapping on the last line\'s geometry', () => {
    const src = '<svg><text x="1" y="2">One<tspan x="3" dy="1.2em">Two</tspan></text></svg>';
    const { ranges, outcomes } = planTextEdits(src, [{ selector: '/svg[1]/text[1]', text: 'Eins\nZwei\nDrei' }]);
    expect(outcomes[0].status).toBe('applied');
    expect(apply(src, ranges)).toBe(
      '<svg><text x="1" y="2"><tspan x="1">Eins</tspan><tspan x="3" dy="1.2em">Zwei</tspan><tspan x="3" dy="1.2em">Drei</tspan></text></svg>'
    );
  });

  it('does not corrupt a label when the selector also names a tspan inside it', () => {
    // "text, tspan" names the label AND its own line. A block range contains the
    // tspan's range, overlaps are only checked BETWEEN edits, and applyRanges
    // splices right-to-left — so an inner write would land first and leave the
    // outer one's end offset pointing into shifted text. Newlines are refused
    // for a lone run, so the tspan yields no range at all and the label is
    // rewritten once, whole. The dropped match is reported, not swallowed.
    const src = '<svg><text x="1" y="2">One<tspan x="3" dy="1.2em">Two</tspan></text></svg>';
    const { ranges, outcomes } = planTextEdits(src, [{ selector: 'text, tspan', text: 'Eins\nZwei' }]);
    expect(ranges).toHaveLength(1);
    expect(apply(src, ranges)).toBe(
      '<svg><text x="1" y="2"><tspan x="1">Eins</tspan><tspan x="3" dy="1.2em">Zwei</tspan></text></svg>'
    );
    expect(outcomes[0].detail).toMatch(/hold a single run, not lines/);
  });

  it('refuses newlines aimed at something that is not a label', () => {
    // A tspan holds one run. Writing "A\nB" into it put a literal newline into
    // character data, which renders as a space and reported success.
    const src = '<svg><text>One<tspan>Two</tspan></text></svg>';
    const { ranges, outcomes } = planTextEdits(src, [{ selector: '/svg[1]/text[1]/tspan[1]', text: 'A\nB' }]);
    expect(ranges).toEqual([]);
    expect(outcomes[0].status).toBe('failed');
    expect(outcomes[0].detail).toMatch(/is not one — it holds a single run/);
  });

  it('resolves a container holding one label through to that label', () => {
    // query answers "#shape211 text"; the model sends "#shape211", dropping the
    // suffix exactly as it drops a repeated path step. The group holds one
    // label, so there is nothing else it could have meant.
    const src = '<svg><g id="shape211"><rect/><text x="1" y="2">Gross Area<tspan x="3" dy="1.2em">545</tspan></text></g></svg>';
    const { ranges, outcomes } = planTextEdits(src, [{ selector: '#shape211', text: 'Bruttofläche\n545' }]);
    expect(outcomes[0].status).toBe('applied');
    expect(apply(src, ranges)).toBe(
      '<svg><g id="shape211"><rect/><text x="1" y="2"><tspan x="1">Bruttofläche</tspan><tspan x="3" dy="1.2em">545</tspan></text></g></svg>'
    );
    expect(outcomes[0].detail).toMatch(/addressed a container holding one label/);
  });

  it('ignores a non-rendering desc when picking the sole label', () => {
    // Exporters write a <desc> beside the visible <text>; it never renders, so
    // the pair is not ambiguous.
    const src = '<svg><g id="s"><desc>Boundary</desc><text>Boundary</text></g></svg>';
    const { ranges, outcomes } = planTextEdits(src, [{ selector: '#s', text: 'Grenze' }]);
    expect(outcomes[0].status).toBe('applied');
    expect(apply(src, ranges)).toBe('<svg><g id="s"><desc>Boundary</desc><text>Grenze</text></g></svg>');
  });

  it('still refuses a container holding two labels', () => {
    const src = '<svg><g id="s"><text>one</text><text>two</text></g></svg>';
    const { ranges, outcomes } = planTextEdits(src, [{ selector: '#s', text: 'x' }]);
    expect(ranges).toEqual([]);
    expect(outcomes[0].detail).toMatch(/The text inside is at:/);
  });

  it('lets an explicit empty line clear one', () => {
    // Omission keeps a line, so blanking one has to be sayable another way.
    const src = '<svg><text x="1" y="2">One<tspan x="3" dy="1.2em">Two</tspan></text></svg>';
    const { ranges } = planTextEdits(src, [{ selector: '/svg[1]/text[1]', text: 'Eins\n' }]);
    expect(apply(src, ranges)).toBe(
      '<svg><text x="1" y="2"><tspan x="1">Eins</tspan><tspan x="3" dy="1.2em"></tspan></text></svg>'
    );
  });

  it('leaves a single-line edit meaning exactly what it did before', () => {
    // The common export shape, and the reason a plain string must NOT be read as
    // the whole block: doing so would delete the tspan on every label like this.
    const src = '<svg><text>Gross Area<tspan>545</tspan></text></svg>';
    const { ranges, outcomes } = planTextEdits(src, [{ selector: '/svg[1]/text[1]', text: 'Bruttofläche' }]);
    expect(outcomes[0].status).toBe('applied');
    expect(apply(src, ranges)).toBe('<svg><text>Bruttofläche<tspan>545</tspan></text></svg>');
  });

  it('reports an address that matched nothing', () => {
    const { outcomes } = planTextEdits('<svg><text>a</text></svg>', [{ selector: '#missing', text: 'x' }]);
    expect(outcomes[0]).toMatchObject({ status: 'failed', matched: 0 });
    expect(outcomes[0].detail).toMatch(/matched no element/);
  });

  it('reports a malformed selector', () => {
    const { outcomes } = planTextEdits('<svg><text>a</text></svg>', [{ selector: 'text[[[', text: 'x' }]);
    expect(outcomes[0].detail).toMatch(/not a valid CSS selector/);
  });

  it('is unavailable on an invalid document, and says to use replace_lines', () => {
    const r = planTextEdits('<svg><g><text>half typed', [{ selector: 'text', text: 'x' }]);
    expect(r.available).toBe(false);
    expect(r.ranges).toEqual([]);
    expect(r.reason).toMatch(/not valid XML right now/);
    expect(r.reason).toMatch(/Use replace_lines/);
  });

  it('applies the good edits and reports the rest', () => {
    const src = '<svg><text>a</text><text>b</text></svg>';
    const { ranges, outcomes } = planTextEdits(src, [
      { selector: '/svg[1]/text[1]', text: 'A' },
      { selector: '#nope', text: 'x' },
    ]);
    expect(apply(src, ranges)).toBe('<svg><text>A</text><text>b</text></svg>');
    expect(outcomes.map((o) => o.status)).toEqual(['applied', 'failed']);
  });
});

describe('a leading text run before children is editable', () => {
  const apply = (src: string, ranges: { start: number; end: number; replacement: string }[]) => {
    let out = src;
    for (const r of [...ranges].sort((a, b) => b.start - a.start)) out = out.slice(0, r.start) + r.replacement + out.slice(r.end);
    return out;
  };

  it('reads and writes the same node, with no read/write asymmetry', () => {
    // The real export shape: the label sits before its tspans.
    const src = '<svg><text>AdventureWorks Schema<tspan dy="1.2em">November 2005</tspan></text></svg>';
    const doc = parse(src);
    const el = doc.querySelector('text')!;

    expect(directText(el)).toBe('AdventureWorks Schema');           // query offers it
    const r = textRangeOf(src, doc, el)!;                            // set_text accepts it
    expect(src.slice(r.start, r.end)).toBe('AdventureWorks Schema');

    const { ranges } = planTextEdits(src, [{ selector: '/svg[1]/text[1]', text: 'AdventureWorks-Schema' }]);
    expect(apply(src, ranges)).toBe('<svg><text>AdventureWorks-Schema<tspan dy="1.2em">November 2005</tspan></text></svg>');
  });

  it('still refuses two separate runs, which have no single span', () => {
    const src = '<svg><text>a<tspan>b</tspan>c</text></svg>';
    const doc = parse(src);
    expect(textRangeOf(src, doc, doc.querySelector('text')!)).toBeNull();
  });

  it('everything query offers as text, set_text accepts', () => {
    const src = '<svg><text>PK<tspan>ID</tspan></text><text>plain</text><g><rect/></g></svg>';
    const doc = parse(src);
    const all = Array.from(doc.querySelectorAll('*'));
    for (const el of all) {
      const offered = describeMatches(src, doc, [el])[0].text !== undefined;
      const writable = textRangeOf(src, doc, el) !== null;
      expect(offered).toBe(writable);
    }
  });
});

describe('planAttributeEdits', () => {
  const apply = (src: string, ranges: { start: number; end: number; replacement: string }[]) => {
    let out = src;
    for (const r of [...ranges].sort((a, b) => b.start - a.start)) out = out.slice(0, r.start) + r.replacement + out.slice(r.end);
    return out;
  };

  it('changes an existing attribute', () => {
    const src = '<svg><rect id="a" fill="#000" stroke="none"/></svg>';
    const { ranges } = planAttributeEdits(src, [{ selector: '#a', name: 'fill', value: '#fff' }]);
    expect(apply(src, ranges)).toBe('<svg><rect id="a" fill="#fff" stroke="none"/></svg>');
  });

  it('adds an attribute that is not there', () => {
    const src = '<svg><rect id="a"/></svg>';
    const { ranges } = planAttributeEdits(src, [{ selector: '#a', name: 'fill', value: 'red' }]);
    expect(apply(src, ranges)).toBe('<svg><rect id="a" fill="red"/></svg>');
  });

  it('adds to a non-self-closing tag', () => {
    const src = '<svg><g id="a"><rect/></g></svg>';
    const { ranges } = planAttributeEdits(src, [{ selector: '#a', name: 'opacity', value: '0.5' }]);
    expect(apply(src, ranges)).toBe('<svg><g id="a" opacity="0.5"><rect/></g></svg>');
  });

  it('removes an attribute on a null value', () => {
    const src = '<svg><rect id="a" fill="#000" stroke="none"/></svg>';
    const { ranges } = planAttributeEdits(src, [{ selector: '#a', name: 'fill', value: null }]);
    expect(apply(src, ranges)).toBe('<svg><rect id="a" stroke="none"/></svg>');
  });

  it('changes every match of a CSS selector', () => {
    const src = '<svg><rect class="st1" fill="#000"/><rect class="st1" fill="#000"/><rect class="st2" fill="#000"/></svg>';
    const { ranges, outcomes } = planAttributeEdits(src, [{ selector: '.st1', name: 'fill', value: 'red' }]);
    expect(outcomes[0].matched).toBe(2);
    expect(apply(src, ranges)).toBe('<svg><rect class="st1" fill="red"/><rect class="st1" fill="red"/><rect class="st2" fill="#000"/></svg>');
  });

  it('touches only the addressed element, not similar text elsewhere', () => {
    const src = '<svg><desc>fill="#000"</desc><rect id="a" fill="#000"/></svg>';
    const { ranges } = planAttributeEdits(src, [{ selector: '#a', name: 'fill', value: 'red' }]);
    expect(apply(src, ranges)).toBe('<svg><desc>fill="#000"</desc><rect id="a" fill="red"/></svg>');
  });

  it('handles single-quoted and spaced attributes', () => {
    const src = "<svg><rect id='a' fill = '#000'/></svg>";
    const { ranges } = planAttributeEdits(src, [{ selector: '#a', name: 'fill', value: 'red' }]);
    expect(apply(src, ranges)).toBe('<svg><rect id=\'a\' fill="red"/></svg>');
  });

  it('escapes the value', () => {
    const src = '<svg><rect id="a"/></svg>';
    const { ranges } = planAttributeEdits(src, [{ selector: '#a', name: 'data-x', value: 'a & b "c"' }]);
    expect(apply(src, ranges)).toContain('data-x="a &amp; b &quot;c&quot;"');
  });

  it('is unavailable on an invalid document', () => {
    const r = planAttributeEdits('<svg><rect fill="red"', [{ selector: 'rect', name: 'fill', value: 'x' }]);
    expect(r.available).toBe(false);
    expect(r.reason).toMatch(/Use replace_lines/);
  });

  it('reports removing an attribute that was never there', () => {
    const { outcomes } = planAttributeEdits('<svg><rect id="a"/></svg>', [{ selector: '#a', name: 'fill', value: null }]);
    expect(outcomes[0].status).toBe('failed');
  });
});

describe('a presentation attribute a CSS rule overrides', () => {
  const CSS_DOC = [
    '<svg>',
    '  <style type="text/css">',
    '  .st1 {fill:#800080;fill-opacity:0.047;}',
    '  .st2 {font-size:2em;}',
    '  </style>',
    '  <rect class="st1" fill="#800080"/>',
    '  <rect class="st3" fill="#000"/>',
    '</svg>',
  ].join('\n');

  it('warns that the drawing will not change, and where to edit instead', () => {
    // The silent no-op: presentation attributes are the lowest priority in the
    // SVG cascade, so .st1 {fill:…} wins and the box stays purple.
    const { outcomes } = planAttributeEdits(CSS_DOC, [{ selector: '.st1', name: 'fill', value: 'red' }]);
    expect(outcomes[0].status).toBe('applied');
    expect(outcomes[0].detail).toMatch(/overrides a presentation attribute/);
    expect(outcomes[0].detail).toMatch(/\.st1/);
    expect(outcomes[0].detail).toMatch(/Change the rule instead, with set_style_rule/);
  });

  it('says nothing when no rule sets that property', () => {
    const { outcomes } = planAttributeEdits(CSS_DOC, [{ selector: '.st3', name: 'fill', value: 'red' }]);
    expect(outcomes[0].status).toBe('applied');
    expect(outcomes[0].detail).toBeUndefined();
  });

  it('says nothing when the rule sets a different property', () => {
    const { outcomes } = planAttributeEdits(CSS_DOC, [{ selector: '.st1', name: 'stroke', value: 'red' }]);
    expect(outcomes[0].detail).toBeUndefined();
  });

  it('is not confused by a property name appearing inside another', () => {
    // .st1 sets fill-opacity as well as fill; asking for fill-opacity must match
    // that rule, and asking for fill must not match on the strength of it.
    const { outcomes } = planAttributeEdits(CSS_DOC, [{ selector: '.st1', name: 'fill-opacity', value: '1' }]);
    expect(outcomes[0].detail).toMatch(/overrides a presentation attribute/);
  });

  it('still applies the edit — it is a warning, not a refusal', () => {
    const { ranges } = planAttributeEdits(CSS_DOC, [{ selector: '.st1', name: 'fill', value: 'red' }]);
    expect(ranges).toHaveLength(1);
  });
});

// resolveWithin — the same addressing rooted at an element rather than a
// document, so a detached subtree (get_element_bounds renders into one) can
// take both address forms instead of CSS only.
describe('resolveWithin', () => {
  const detached = () => {
    const host = document.createElement('div');
    host.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="root">'
      + '<g><rect id="a"/><rect id="b"/></g></svg>';
    return host.querySelector('svg')!;
  };

  it('resolves a positional path from the root element', () => {
    const found = resolveWithin(detached(), '/svg[1]/g[1]/rect[2]');
    expect(isSelectorError(found)).toBe(false);
    expect((found as Element[]).map((e) => e.getAttribute('id'))).toEqual(['b']);
  });

  it('resolves a CSS selector', () => {
    const found = resolveWithin(detached(), 'rect') as Element[];
    expect(found.map((e) => e.getAttribute('id'))).toEqual(['a', 'b']);
  });

  it('includes the root itself, which querySelectorAll never returns', () => {
    const root = detached();
    expect(resolveWithin(root, '.root')).toEqual([root]);
    expect((resolveWithin(root, 'svg') as Element[])[0]).toBe(root);
  });

  it('reports a malformed selector rather than throwing', () => {
    const found = resolveWithin(detached(), 'rect[[[');
    expect(isSelectorError(found)).toBe(true);
  });

  it('matches what resolveSelector does on the same markup', () => {
    const doc = parseSvg('<svg xmlns="http://www.w3.org/2000/svg" class="root">'
      + '<g><rect id="a"/><rect id="b"/></g></svg>')!;
    for (const sel of ['rect', '.root', 'svg', 'g > rect', '/svg[1]/g[1]/rect[1]']) {
      const viaDoc = resolveSelector(doc, sel) as Element[];
      const viaRoot = resolveWithin(doc.documentElement, sel) as Element[];
      expect(viaRoot.map(pathOf)).toEqual(viaDoc.map(pathOf));
    }
  });
});
