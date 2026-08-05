/**
 * Addressing elements by structure instead of by text.
 *
 * Every edit tool takes the same kind of address, resolved here once:
 *
 *   - a POSITIONAL PATH — `/svg[1]/g[3]/rect[2]` — denoting exactly one node.
 *     This is identity: it cannot accidentally mean a different element, which
 *     is the failure mode text matching could never rule out. It is also the
 *     format `computeXPath` already emits for click-to-select, so the editor and
 *     the model describe an element the same way.
 *   - a CSS SELECTOR — `.st1`, `#logo`, `rect` — denoting a set. A path cannot
 *     express "every element with this class", and exported diagrams lean on
 *     classes heavily, so both are worth having. They are different jobs, not
 *     two ways of doing one.
 *
 * Paths are walked here rather than handed to `document.evaluate`. Browser XPath
 * is 1.0, which has no default namespace, so an unprefixed name test matches
 * only null-namespace elements while SVG elements are always namespaced:
 * evaluating `/svg[1]/g[1]/rect[2]` against a real SVG document returns ZERO
 * matches and no error. Walking the tree sidesteps the whole question.
 *
 * Editing resolves against a STRICT parse. A document that does not parse gets
 * no structural addressing at all — the caller falls back to line editing —
 * because the lenient HTML parser silently restructures broken markup, and
 * source offsets taken from a restructured tree would point at the wrong bytes.
 * Refusing is recoverable; editing the wrong element is not.
 */

/** A start tag's extent in the source, and what it opens. */
export interface StartTag {
  start: number;
  end: number;
  name: string;
  selfClosing: boolean;
}

const NAME_START = /[A-Za-z_:]/;

/** Index just past the tag beginning at `i`, respecting quoted attribute values
 * (an attribute may legitimately contain `>`). */
function endOfTag(src: string, i: number): number {
  for (let j = i + 1; j < src.length; j++) {
    const c = src[j];
    if (c === '"' || c === "'") {
      const close = src.indexOf(c, j + 1);
      if (close === -1) return src.length;
      j = close;
      continue;
    }
    if (c === '>') return j + 1;
  }
  return src.length;
}

function readName(src: string, i: number): string {
  let j = i;
  while (j < src.length && /[\w.:-]/.test(src[j])) j += 1;
  return src.slice(i, j);
}

/** A tag as the scanner sees it, before any of it is matched to the tree. */
interface TagToken {
  kind: 'open' | 'close' | 'self';
  start: number;
  end: number;
  name: string;
}

/**
 * Every tag in source order, with comments, CDATA, processing instructions and
 * doctypes stepped over.
 *
 * One scan behind both `startTagRanges` and `elementExtents`: the rules for what
 * is NOT a tag are fiddly, and two copies of them would eventually disagree
 * about where an element begins and ends.
 */
function scanTags(source: string): TagToken[] {
  const out: TagToken[] = [];
  let i = 0;
  while (i < source.length) {
    if (source.startsWith('<!--', i)) {
      const e = source.indexOf('-->', i);
      i = e === -1 ? source.length : e + 3;
      continue;
    }
    if (source.startsWith('<![CDATA[', i)) {
      const e = source.indexOf(']]>', i);
      i = e === -1 ? source.length : e + 3;
      continue;
    }
    if (source.startsWith('<?', i)) {
      const e = source.indexOf('?>', i);
      i = e === -1 ? source.length : e + 2;
      continue;
    }
    if (source.startsWith('<!', i)) {
      i = endOfTag(source, i);
      continue;
    }
    if (source[i] === '<' && source[i + 1] === '/' && NAME_START.test(source[i + 2] ?? '')) {
      const end = endOfTag(source, i);
      out.push({ kind: 'close', start: i, end, name: readName(source, i + 2).toLowerCase() });
      i = end;
      continue;
    }
    if (source[i] === '<' && NAME_START.test(source[i + 1] ?? '')) {
      const end = endOfTag(source, i);
      out.push({
        kind: source[end - 2] === '/' ? 'self' : 'open',
        start: i,
        end,
        name: readName(source, i + 1).toLowerCase(),
      });
      i = end;
      continue;
    }
    const next = source.indexOf('<', i + 1);
    if (next === -1) break;
    i = next;
  }
  return out;
}

/**
 * Every element start tag in source order.
 *
 * For a well-formed document this is the same order as a pre-order walk of the
 * parsed tree, which is what lets a DOM node be mapped back to the bytes that
 * produced it without the parser telling us where anything was.
 */
export function startTagRanges(source: string): StartTag[] {
  return scanTags(source)
    .filter((t) => t.kind !== 'close')
    .map((t) => ({ start: t.start, end: t.end, name: t.name, selfClosing: t.kind === 'self' }));
}

/** An element's whole extent in the source, opening angle bracket to the byte
 * after its closing tag. */
export interface ElementExtent {
  start: number;
  end: number;
}

/**
 * Pair each element with ALL the bytes that produced it, children included.
 *
 * `elementSourceRanges` stops at the start tag, which is everything an attribute
 * edit needs and nothing removing or wrapping an element can use. Close tags are
 * matched with a stack rather than by searching for `</name>`, so a `<g>` inside
 * a `<g>` ends at its own closing tag and not its parent's.
 *
 * Empty when the tags do not balance or the two orders disagree — the same
 * refusal `elementSourceRanges` makes, for the same reason.
 */
export function elementExtents(source: string, doc: Document): Map<Element, ElementExtent> {
  const extents: ElementExtent[] = [];
  const open: number[] = [];
  for (const t of scanTags(source)) {
    if (t.kind === 'self') {
      extents.push({ start: t.start, end: t.end });
      continue;
    }
    if (t.kind === 'open') {
      extents.push({ start: t.start, end: -1 });
      open.push(extents.length - 1);
      continue;
    }
    // A close tag with nothing open means the source does not balance.
    const idx = open.pop();
    if (idx === undefined) return new Map();
    extents[idx].end = t.end;
  }
  if (open.length > 0) return new Map();

  const elements: Element[] = [];
  const walk = (el: Element) => {
    elements.push(el);
    for (const child of Array.from(el.children)) walk(child);
  };
  walk(doc.documentElement);

  const map = new Map<Element, ElementExtent>();
  if (elements.length !== extents.length) return map;
  for (let i = 0; i < elements.length; i++) map.set(elements[i], extents[i]);
  return map;
}

export interface SvgValidity {
  valid: boolean;
  /** The parsed document, only when valid. */
  doc?: Document;
  /** Why it failed, for the model and the user — usually with a position. */
  message?: string;
}

/**
 * Is the document well-formed XML right now?
 *
 * Asked and answered in one place, up front, so structural tools can be
 * ADVERTISED as available or not rather than each failing in its own way when
 * the model tries one. A half-typed document is a routine state in an editor,
 * not an error, and the useful response is "use line editing for now".
 */
export function validateSvg(source: string): SvgValidity {
  if (!source.trim()) return { valid: false, message: 'the document is empty' };
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(source, 'text/xml');
  } catch (err) {
    return { valid: false, message: err instanceof Error ? err.message : 'could not be parsed' };
  }
  const error = doc.querySelector('parsererror');
  if (error) {
    // Browsers wrap the useful sentence in boilerplate ("This page contains the
    // following errors… Below is a rendering of the page up to the first
    // error."). Keep the part that names the position, since that is what the
    // model needs to go and fix it.
    const raw = (error.textContent ?? '').trim().replace(/\s+/g, ' ');
    const specific = /error on line \d+ at column \d+:[^]*?(?= Below is a rendering|$)/i.exec(raw);
    return {
      valid: false,
      message: (specific ? specific[0] : raw || 'not well-formed XML').trim().slice(0, 300),
    };
  }
  if (!doc.documentElement) return { valid: false, message: 'no root element' };
  return { valid: true, doc };
}

/**
 * Parse strictly. `null` means the document is not valid XML right now, and the
 * caller should fall back to line editing.
 */
export function parseSvg(source: string): Document | null {
  return validateSvg(source).doc ?? null;
}

/** `rect[2]` → the 2nd `rect` child; a bare `rect` means the 1st. */
function parseStep(step: string): { name: string; index: number } | null {
  const m = /^([\w.:-]+)(?:\[(\d+)\])?$/.exec(step);
  if (!m) return null;
  const index = m[2] === undefined ? 1 : Number(m[2]);
  return index >= 1 ? { name: m[1].toLowerCase(), index } : null;
}

/** Walk a positional path from a root element. Returns the single node it
 * denotes, or nothing. */
function resolvePathFrom(rootEl: Element | null, path: string): Element[] {
  const steps = path.split('/').filter((s) => s !== '');
  if (steps.length === 0) return [];

  const root = parseStep(steps[0]);
  let current: Element | null = rootEl;
  if (!root || !current || current.tagName.toLowerCase() !== root.name || root.index !== 1) return [];

  for (const raw of steps.slice(1)) {
    const step = parseStep(raw);
    if (!step || !current) return [];
    const siblings: Element[] = Array.from(current.children).filter((c) => c.tagName.toLowerCase() === step.name);
    current = siblings[step.index - 1] ?? null;
  }
  return current ? [current] : [];
}

/**
 * Why a path matched nothing, in terms of what IS there.
 *
 * A bare "matched no element" leaves a model with nothing to do but guess
 * again, and it guesses the same way twice. Walking the path to the last step
 * that does resolve and naming that node's real children turns a dead end into
 * a correction it can make without another round trip.
 */
export function explainPathFailure(doc: Document, path: string): string {
  const steps = path.split('/').filter((s) => s !== '');
  const root = steps[0] ? parseStep(steps[0]) : null;
  const docEl = doc.documentElement;
  if (!root || !docEl || docEl.tagName.toLowerCase() !== root.name || root.index !== 1) {
    return `matched no element: a path must start at /${docEl ? docEl.tagName.toLowerCase() : 'svg'}[1]`;
  }

  let current: Element = docEl;
  let reached = `/${root.name}[1]`;
  for (const raw of steps.slice(1)) {
    const step = parseStep(raw);
    if (!step) return `matched no element: "${raw}" is not a valid path step`;
    const siblings = Array.from(current.children).filter((c) => c.tagName.toLowerCase() === step.name);
    const next = siblings[step.index - 1];
    if (next) {
      current = next;
      reached += `/${step.name}[${step.index}]`;
      continue;
    }
    // This is the step that failed. Say what the parent actually holds.
    const counts = new Map<string, number>();
    for (const c of current.children) {
      const n = c.tagName.toLowerCase();
      counts.set(n, (counts.get(n) ?? 0) + 1);
    }
    const children = counts.size === 0
      ? 'no child elements'
      : Array.from(counts).map(([n, k]) => (k === 1 ? `${n}[1]` : `${n}[1..${k}]`)).join(', ');
    const why = siblings.length === 0
      ? `has no <${step.name}> child`
      : `has only ${siblings.length} <${step.name}> child(ren), so [${step.index}] is out of range`;
    return `matched no element: ${reached} ${why}. Its children are: ${children}. Use query to see the real paths.`;
  }
  return 'matched no element. Use query to see what is there.';
}

/** The "nothing matched" message for either address form. */
export function describeNoMatch(doc: Document, selector: string): string {
  const trimmed = selector.trim();
  if (trimmed.startsWith('/')) return explainPathFailure(doc, trimmed);
  return `matched no element. "${trimmed}" is read as a CSS selector; a positional path has to start with "/". Use query to see what is there.`;
}

export interface SelectorError {
  error: string;
}

/** True for the failure shape, so callers can report instead of guessing. */
export function isSelectorError(v: unknown): v is SelectorError {
  return typeof v === 'object' && v !== null && 'error' in v;
}

/**
 * Resolve either address form against a parsed document, in document order.
 *
 * A leading `/` means a positional path; anything else is CSS. An address that
 * matches nothing is not an error here — the caller decides whether zero matches
 * is a problem — but a malformed CSS selector is, because the model can fix that.
 */
export function resolveSelector(doc: Document, selector: string): Element[] | SelectorError {
  return resolveWithin(doc.documentElement, selector);
}

/**
 * The same resolution rooted at an element rather than a document.
 *
 * `get_element_bounds` measures a document parsed into a detached container, so
 * its root is an `<svg>` element and not `documentElement`. Without this it
 * could only take CSS, while every other tool took both — and the prompt said
 * both worked everywhere, so a path handed to it came back as "invalid CSS
 * selector".
 */
export function resolveWithin(root: Element | null, selector: string): Element[] | SelectorError {
  const trimmed = selector.trim();
  if (trimmed === '') return { error: 'empty selector' };
  if (!root) return [];
  if (trimmed.startsWith('/')) return resolvePathFrom(root, trimmed);
  try {
    const descendants = Array.from(root.querySelectorAll(trimmed));
    // querySelectorAll never returns the element it was called on, and the root
    // <svg> is a legitimate target for both `svg` and a class selector.
    return root.matches(trimmed) ? [root, ...descendants] : descendants;
  } catch {
    return {
      error: `"${trimmed}" is not a valid CSS selector, and is not a path (those start with "/"). ` +
        'Use a path like /svg[1]/g[3]/rect[2] for one element, or CSS like #logo, .st1, rect for a set.',
    };
  }
}

/**
 * Pair each element with the source bytes that produced it.
 *
 * Empty when the two orders disagree, which would mean the source scan and the
 * parser saw different documents. Mapping anyway would edit the wrong element.
 */
export function elementSourceRanges(source: string, doc: Document): Map<Element, StartTag> {
  const tags = startTagRanges(source);
  const elements: Element[] = [];
  const walk = (el: Element) => {
    elements.push(el);
    for (const child of Array.from(el.children)) walk(child);
  };
  walk(doc.documentElement);

  const map = new Map<Element, StartTag>();
  if (elements.length !== tags.length) return map;
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].tagName.toLowerCase() !== tags[i].name) return new Map();
    map.set(elements[i], tags[i]);
  }
  return map;
}

/**
 * The source range holding a node's own character data, and what it currently
 * contains — everything needed to rewrite the text without touching markup.
 *
 * `null` when the node has element children mixed into its text, or when it is
 * self-closing or unclosed. Mixed content has no single contiguous range to
 * replace, so rather than pick one and hope, such a node is refused and the
 * caller addresses the child nodes individually — which it can, because each
 * has its own path.
 */
export function textRangeOf(
  source: string,
  doc: Document,
  el: Element,
  /** Prebuilt map, so a caller editing many nodes does not rebuild it per node —
   * that rescanned the whole document 750 times for 750 edits. */
  prebuilt?: Map<Element, StartTag>,
): { start: number; end: number; current: string } | null {
  const ranges = prebuilt ?? elementSourceRanges(source, doc);
  const tag = ranges.get(el);
  if (!tag || tag.selfClosing) return null;

  const isText = (n: Node) => n.nodeType === 3 || n.nodeType === 4;
  const textNodes = Array.from(el.childNodes).filter(isText);
  // Two separate runs — `<text>a<tspan>b</tspan>c</text>` — have no single span
  // to replace, and picking one would silently drop the other.
  if (textNodes.length !== 1) return null;

  if (el.children.length === 0) {
    const close = source.indexOf('</', tag.end);
    if (close === -1) return null;
    const between = source.slice(tag.end, close);
    if (between.includes('<')) return null;
    return { start: tag.end, end: close, current: between };
  }

  // With children, only a LEADING run is contiguous — it ends where the first
  // child begins. This is the common export shape, where the label sits before
  // its tspans: `<text>AdventureWorks Schema<tspan>November 2005</tspan></text>`.
  // Refusing it would leave real labels unaddressable while `query` still
  // reported them, so the read and write sides would disagree.
  if (!el.firstChild || !isText(el.firstChild)) return null;
  const firstChildTag = ranges.get(el.children[0]);
  if (!firstChildTag) return null;
  const between = source.slice(tag.end, firstChildTag.start);
  if (between.includes('<')) return null;
  return { start: tag.end, end: firstChildTag.start, current: between };
}

/** One requested attribute change. A null value removes the attribute. */
export interface AttributeEdit {
  selector: string;
  name: string;
  value: string | null;
}

/**
 * CSS selectors in the document's own `<style>` blocks that set `property` on any
 * of `elements` — i.e. rules that will beat a presentation attribute.
 *
 * Exported diagrams put fill and font in a style block rather than on elements,
 * so `<rect class="st1" fill="red"/>` under `.st1 {fill:#800080}` still renders
 * purple. Parsed with a regex rather than CSSOM because the rule text is what has
 * to be reported back, and only enough structure is needed to name it.
 */
function cssRulesOverriding(doc: Document, elements: Element[], property: string): string[] {
  const css = Array.from(doc.getElementsByTagName('style')).map((s) => s.textContent ?? '').join('\n');
  if (!css.trim()) return [];
  const hits: string[] = [];
  for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const selectorText = m[1].trim();
    const body = m[2];
    if (!new RegExp(`(^|[;\\s])${property}\\s*:`).test(body)) continue;
    for (const one of selectorText.split(',').map((x) => x.trim()).filter(Boolean)) {
      let matches = false;
      try {
        matches = elements.some((el) => el.matches(one));
      } catch {
        continue; // a selector this engine cannot parse tells us nothing
      }
      if (matches && !hits.includes(one)) hits.push(one);
    }
  }
  return hits;
}

/**
 * Escape a string for literal use inside a regular expression.
 *
 * An attribute name arrives from the model and goes straight into a RegExp, so
 * an unescaped one is not cosmetic: "wid(th" threw SyntaxError out of the
 * planner and killed the whole turn, and a "." silently matched a neighbouring
 * attribute and replaced the wrong one.
 */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Escape a value for a double-quoted attribute. */
function escapeAttr(s: string): string {
  return s.replace(/[&<>"]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'));
}

/**
 * Resolve attribute changes to source ranges.
 *
 * Edits happen inside the element's start tag, so nothing outside it moves and
 * the document is never re-serialized — the tradeoff that made a DOM-based
 * editor look unattractive disappears when the DOM is used only to locate.
 */
export function planAttributeEdits(
  source: string,
  edits: AttributeEdit[],
): { ranges: TextEditRange[]; outcomes: TextEditOutcome[]; available: boolean; reason?: string } {
  const validity = validateSvg(source);
  if (!validity.doc) {
    return {
      ranges: [], outcomes: [], available: false,
      reason: `the document is not valid XML right now (${validity.message}), so elements cannot be addressed. Use replace_lines until it parses.`,
    };
  }
  const doc = validity.doc;
  const tags = elementSourceRanges(source, doc);
  const ranges: TextEditRange[] = [];
  const outcomes: TextEditOutcome[] = [];

  for (const edit of edits) {
    const found = resolveSelector(doc, edit.selector);
    if (isSelectorError(found)) {
      outcomes.push({ selector: edit.selector, status: 'failed', matched: 0, detail: found.error, ranges: [] });
      continue;
    }
    if (found.length === 0) {
      outcomes.push({ selector: edit.selector, status: 'failed', matched: 0, detail: describeNoMatch(doc, edit.selector), ranges: [] });
      continue;
    }

    const resolved: TextEditRange[] = [];
    for (const el of found) {
      const tag = tags.get(el);
      if (!tag) continue;
      const text = source.slice(tag.start, tag.end);
      const attr = new RegExp(`\\s${escapeRegExp(edit.name)}\\s*=\\s*(["'])[\\s\\S]*?\\1`);
      const m = attr.exec(text);

      if (m) {
        const replacement = edit.value === null ? '' : ` ${edit.name}="${escapeAttr(edit.value)}"`;
        resolved.push({ start: tag.start + m.index, end: tag.start + m.index + m[0].length, replacement });
      } else if (edit.value !== null) {
        // Absent: insert just before the tag closes, leaving everything else put.
        // Two edits setting DIFFERENT attributes land on this same offset and
        // both belong; two setting the SAME one are a contradiction. Zero-width
        // spans cannot overlap, so the key is what tells those apart.
        const at = tag.end - (tag.selfClosing ? 2 : 1);
        resolved.push({
          start: at,
          end: at,
          replacement: ` ${edit.name}="${escapeAttr(edit.value)}"`,
          key: `attr:${edit.name.toLowerCase()}`,
        });
      }
    }
    ranges.push(...resolved);
    const changed = resolved.length;

    const overridden = changed > 0 ? cssRulesOverriding(doc, found, edit.name) : [];
    outcomes.push(changed > 0
      ? {
          selector: edit.selector,
          status: 'applied',
          matched: changed,
          ranges: resolved,
          // A presentation attribute is the LOWEST priority in the SVG cascade, so
          // a class rule setting the same property wins and the edit has no visible
          // effect. Silently succeeding while nothing changes on screen is the
          // failure this whole approach exists to avoid, so say it.
          detail: overridden.length > 0
            ? `NOTE: the attribute was set, but "${edit.name}" is also set by CSS (${overridden.slice(0, 3).join(', ')}), which overrides a presentation attribute — the drawing will not change. Change the rule instead, with set_style_rule.`
            : undefined,
        }
      : { selector: edit.selector, status: 'failed', matched: found.length, ranges: [], detail: `matched ${found.length} element(s), none of which has a "${edit.name}" attribute to remove` });
  }

  return { ranges, outcomes, available: true };
}

/** One requested change to a declaration inside a `<style>` rule. A null value
 * removes the declaration. */
export interface StyleRuleEdit {
  /** The rule's selector, as written in the block — `.st11`, `text`, `#logo`. */
  selector: string;
  property: string;
  value: string | null;
}

/** Where one rule lives in the source, and what it currently declares. */
interface CssRule {
  /** Absolute span of the whole rule, selector through closing brace. */
  start: number;
  end: number;
  selectors: string[];
  /** Absolute span of what sits between the braces. */
  bodyStart: number;
  bodyEnd: number;
  body: string;
}

/**
 * Locate every rule in every `<style>` block, in absolute source offsets.
 *
 * A regex rather than CSSOM for the same reason `cssRulesOverriding` uses one:
 * what has to come back is a POSITION in the original text, and a parsed
 * stylesheet has thrown that away. Nested at-rules are not handled — these are
 * exported diagrams, whose blocks are flat lists of class rules — and anything
 * unrecognised is simply not matched rather than mangled.
 */
function cssRulesIn(source: string, doc: Document, tags: Map<Element, StartTag>): CssRule[] {
  const rules: CssRule[] = [];
  for (const style of Array.from(doc.getElementsByTagName('style'))) {
    const range = textRangeOf(source, doc, style, tags);
    if (!range) continue;
    const css = range.current;
    for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      const at = m.index ?? 0;
      const bodyStart = range.start + at + m[1].length + 1;
      rules.push({
        start: range.start + at,
        end: range.start + at + m[0].length,
        selectors: m[1].split(',').map((s) => s.trim()).filter(Boolean),
        bodyStart,
        bodyEnd: bodyStart + m[2].length,
        body: m[2],
      });
    }
  }
  return rules;
}

/** A value that would end the declaration or the rule early would corrupt the
 * whole block, and no legitimate value in these documents needs one. */
function badCssValue(value: string): string | null {
  for (const c of ['{', '}', ';']) if (value.includes(c)) return `a CSS value cannot contain "${c}"`;
  if (value.includes('<') || value.includes('>')) return 'a CSS value cannot contain "<" or ">"';
  return null;
}

/**
 * Resolve style-rule changes to source ranges.
 *
 * This is the tool for the edits users actually ask for on exported diagrams.
 * Their fill, stroke-width and font-size live in `.st11 { … }`, not on
 * elements, so "make the boxes blue" and "make the text bigger" cannot be
 * expressed as attributes at all — in a ten-prompt smoke run, three of the five
 * edits that fell back to line editing were rule changes.
 *
 * Only the declaration moves. Rewriting the rule line wholesale is the
 * re-emission failure this whole approach exists to remove, and a rule line in
 * these files carries a dozen unrelated declarations.
 */
export function planStyleRuleEdits(
  source: string,
  edits: StyleRuleEdit[],
): { ranges: TextEditRange[]; outcomes: TextEditOutcome[]; available: boolean; reason?: string } {
  const validity = validateSvg(source);
  if (!validity.doc) {
    return {
      ranges: [], outcomes: [], available: false,
      reason: `the document is not valid XML right now (${validity.message}), so its style blocks cannot be located. Use replace_lines until it parses.`,
    };
  }
  const doc = validity.doc;
  const tags = elementSourceRanges(source, doc);
  const rules = cssRulesIn(source, doc, tags);
  const ranges: TextEditRange[] = [];
  const outcomes: TextEditOutcome[] = [];

  for (const edit of edits) {
    const wanted = edit.selector.trim();
    const property = edit.property.trim();
    const label = `${property} in "${wanted}"`;

    if (!wanted || !property) {
      outcomes.push({ selector: label, status: 'failed', matched: 0, ranges: [], detail: 'both "selector" and "property" are required' });
      continue;
    }
    if (edit.value !== null) {
      const bad = badCssValue(edit.value);
      if (bad) {
        outcomes.push({ selector: label, status: 'failed', matched: 0, ranges: [], detail: bad });
        continue;
      }
    }

    const matching = rules.filter((r) => r.selectors.includes(wanted));
    if (matching.length === 0) {
      const known = Array.from(new Set(rules.flatMap((r) => r.selectors)));
      outcomes.push({
        selector: label,
        status: 'failed',
        matched: 0,
        ranges: [],
        detail: known.length === 0
          ? 'this document has no <style> rules. Set the property on the elements themselves with set_attribute.'
          : `no rule has the selector "${wanted}". The rules in this document are: ${known.slice(0, 25).join(', ')}${known.length > 25 ? `, … (+${known.length - 25} more)` : ''}`,
      });
      continue;
    }

    const resolved: TextEditRange[] = [];
    for (const rule of matching) {
      // A declaration ends at the next semicolon or the closing brace, and
      // starts either at the body's start or just after the previous semicolon.
      const decl = new RegExp(`(^|;)(\\s*)(${escapeRegExp(property)})(\\s*:\\s*)([^;]*)`, 'i').exec(rule.body);

      if (decl) {
        const valueAt = rule.bodyStart + (decl.index ?? 0) + decl[1].length + decl[2].length + decl[3].length + decl[4].length;
        if (edit.value === null) {
          // Take the whole declaration and one separator with it, so removing
          // the last one does not leave a trailing semicolon dangling.
          const from = rule.bodyStart + (decl.index ?? 0) + decl[1].length;
          const to = valueAt + decl[5].length;
          const after = source.slice(to, rule.bodyEnd);
          const sep = /^\s*;/.exec(after);
          resolved.push({ start: from, end: sep ? to + sep[0].length : to, replacement: '' });
        } else {
          resolved.push({ start: valueAt, end: valueAt + decl[5].length, replacement: edit.value });
        }
      } else if (edit.value !== null) {
        // Absent: add it at the front of the rule, where it cannot disturb the
        // spacing of anything already there.
        const needsSemi = rule.body.trim() !== '' && !/^\s*$/.test(rule.body) ;
        resolved.push({
          start: rule.bodyStart,
          end: rule.bodyStart,
          replacement: `${property}:${edit.value}${needsSemi ? ';' : ''}`,
          key: `style:${wanted}:${property}`,
        });
      }
    }

    if (resolved.length === 0) {
      outcomes.push({
        selector: label,
        status: 'failed',
        matched: matching.length,
        ranges: [],
        detail: `"${wanted}" has no "${property}" declaration to remove`,
      });
      continue;
    }

    ranges.push(...resolved);
    outcomes.push({
      selector: label,
      status: 'applied',
      matched: resolved.length,
      detail: matching.length > 1 ? `"${wanted}" is declared by ${matching.length} rules; all were changed` : undefined,
      ranges: resolved,
    });
  }

  return { ranges, outcomes, available: true };
}

const ENTITY_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

/** Re-encode the characters that cannot appear literally in character data. */
export function escapeText(s: string): string {
  return s.replace(/[&<>]/g, (c) => ENTITY_ESCAPES[c]);
}

/** One requested text change, addressed structurally. */
export interface TextEdit {
  /** A positional path, or a CSS selector to change every match. */
  selector: string;
  text: string;
}

/** A resolved change: an exact span of the source and what replaces it. */
export interface TextEditRange {
  start: number;
  end: number;
  replacement: string;
  /**
   * What this change is OF, for spans that occupy no bytes. Two insertions at
   * the same offset cannot overlap, so identity is the only thing that can say
   * whether they contradict each other or merely sit side by side.
   */
  key?: string;
}

export interface TextEditOutcome {
  selector: string;
  status: 'applied' | 'failed';
  /** How many nodes this change reached. */
  matched: number;
  detail?: string;
  /**
   * The spans this one request resolved to. The flat `ranges` list is what gets
   * applied; this is the same spans kept with the request that produced them, so
   * a conflict can be reported against the selector the model actually wrote
   * rather than against an anonymous offset.
   */
  ranges: TextEditRange[];
}

/**
 * Resolve text changes to source ranges, all against one snapshot.
 *
 * Nothing is applied here. The ranges join whatever else the response is doing —
 * line edits included — so two changes touching the same bytes are caught as a
 * conflict rather than compounding, and everything lands in one descending pass.
 */
export function planTextEdits(
  source: string,
  edits: TextEdit[],
): { ranges: TextEditRange[]; outcomes: TextEditOutcome[]; available: boolean; reason?: string } {
  const validity = validateSvg(source);
  if (!validity.doc) {
    return {
      ranges: [],
      outcomes: [],
      available: false,
      reason: `the document is not valid XML right now (${validity.message}), so elements cannot be addressed. Use replace_lines until it parses.`,
    };
  }
  const doc = validity.doc;
  const tags = elementSourceRanges(source, doc);
  const ranges: TextEditRange[] = [];
  const outcomes: TextEditOutcome[] = [];

  for (const edit of edits) {
    const found = resolveSelector(doc, edit.selector);
    if (isSelectorError(found)) {
      outcomes.push({ selector: edit.selector, status: 'failed', matched: 0, detail: found.error, ranges: [] });
      continue;
    }
    if (found.length === 0) {
      outcomes.push({
        selector: edit.selector,
        status: 'failed',
        matched: 0,
        ranges: [],
        detail: describeNoMatch(doc, edit.selector),
      });
      continue;
    }

    const resolved: TextEditRange[] = [];
    const refused: string[] = [];
    for (const el of found) {
      const range = textRangeOf(source, doc, el, tags);
      if (!range) {
        // Mixed content, self-closing, or unclosed: no single run of characters
        // belongs to this node, and its children each have their own address.
        refused.push(pathOf(el));
        continue;
      }
      resolved.push({ start: range.start, end: range.end, replacement: escapeText(edit.text) });
    }

    if (resolved.length === 0) {
      outcomes.push({
        selector: edit.selector,
        status: 'failed',
        matched: found.length,
        ranges: [],
        detail: `matched ${found.length} element(s), but none holds a single run of text — they have child elements. Address the children instead: ${refused.slice(0, 3).join(', ')}`,
      });
      continue;
    }

    ranges.push(...resolved);
    outcomes.push({
      selector: edit.selector,
      status: 'applied',
      matched: resolved.length,
      ranges: resolved,
      detail: refused.length > 0
        ? `${refused.length} match(es) skipped for having child elements; address those directly: ${refused.slice(0, 3).join(', ')}`
        : undefined,
    });
  }

  return { ranges, outcomes, available: true };
}

/** Where a new element goes relative to the one addressed. */
export type InsertPosition = 'before' | 'after' | 'first-child' | 'last-child';

/** One requested insertion of new markup. */
export interface ElementInsert {
  selector: string;
  position: InsertPosition;
  /** The markup to insert. May be several sibling elements. */
  svg: string;
}

/** One requested removal. */
export interface ElementRemoval {
  selector: string;
}

/** The whitespace at the start of the line `offset` sits on, so inserted markup
 * lands at the depth of what it sits beside. */
function indentAt(source: string, offset: number): string {
  const lineStart = source.lastIndexOf('\n', offset - 1) + 1;
  const m = /^[ \t]*/.exec(source.slice(lineStart, offset));
  return m ? m[0] : '';
}

/**
 * Is this a well-formed fragment?
 *
 * Inserted markup is the one thing in this module that the model writes freehand
 * rather than addressing, so it is the one thing that can make a valid document
 * stop parsing. Checked in the same namespace it will land in, so an unprefixed
 * `xlink:href` fails here rather than at the next edit.
 */
function fragmentError(svg: string): string | null {
  if (!svg.trim()) return 'nothing to insert';
  const wrapped = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${svg}</svg>`;
  const probe = validateSvg(wrapped);
  if (!probe.valid) return `the markup is not well-formed (${probe.message})`;
  return null;
}

/**
 * Resolve insertions to zero-width source ranges.
 *
 * An insertion is a range that replaces no bytes, so it travels the same path as
 * every other edit and is conflict-checked against them — which matters, since
 * inserting into an element another call is deleting is a contradiction that
 * looks like nothing at all at the byte level.
 */
export function planElementInserts(
  source: string,
  edits: ElementInsert[],
): { ranges: TextEditRange[]; outcomes: TextEditOutcome[]; available: boolean; reason?: string } {
  const validity = validateSvg(source);
  if (!validity.doc) {
    return {
      ranges: [], outcomes: [], available: false,
      reason: `the document is not valid XML right now (${validity.message}), so there is nothing to insert relative to. Use replace_lines until it parses.`,
    };
  }
  const doc = validity.doc;
  const tags = elementSourceRanges(source, doc);
  const extents = elementExtents(source, doc);
  const ranges: TextEditRange[] = [];
  const outcomes: TextEditOutcome[] = [];

  edits.forEach((edit, i) => {
    const label = `insert ${edit.position} ${JSON.stringify(edit.selector)}`;
    const found = resolveSelector(doc, edit.selector);
    if (isSelectorError(found)) {
      outcomes.push({ selector: label, status: 'failed', matched: 0, ranges: [], detail: found.error });
      return;
    }
    if (found.length === 0) {
      outcomes.push({ selector: label, status: 'failed', matched: 0, ranges: [], detail: describeNoMatch(doc, edit.selector) });
      return;
    }
    const bad = fragmentError(edit.svg);
    if (bad) {
      outcomes.push({ selector: label, status: 'failed', matched: found.length, ranges: [], detail: bad });
      return;
    }

    const resolved: TextEditRange[] = [];
    const refused: string[] = [];
    for (const el of found) {
      const tag = tags.get(el);
      const extent = extents.get(el);
      if (!tag || !extent) { refused.push(pathOf(el)); continue; }

      let at: number | null = null;
      if (edit.position === 'before') at = extent.start;
      else if (edit.position === 'after') at = extent.end;
      else if (tag.selfClosing) at = null; // no inside to put anything in
      else if (edit.position === 'first-child') at = tag.end;
      else {
        // Just past the last child, NOT just before the closing tag: the
        // whitespace that indents `</g>` belongs to `</g>`, and inserting into
        // the middle of it left a line of stray spaces and pulled the closing
        // tag up onto the new element's line.
        const close = source.lastIndexOf('</', extent.end);
        at = close < 0 ? null : close - (/[ \t\r\n]*$/.exec(source.slice(tag.end, close))?.[0].length ?? 0);
      }

      if (at === null || at < 0) { refused.push(pathOf(el)); continue; }

      const indent = indentAt(source, extent.start);
      const inner = edit.position === 'first-child' || edit.position === 'last-child' ? indent + '  ' : indent;
      const body = edit.svg.trim();
      const replacement = edit.position === 'before' || edit.position === 'first-child'
        ? `${body}\n${inner}`
        : `\n${inner}${body}`;
      resolved.push({
        start: at,
        end: at,
        replacement,
        // Two insertions at one point are usually both wanted — two icons side
        // by side — so they are kept distinct rather than treated as rivals.
        key: `insert:${i}:${pathOf(el)}`,
      });
    }

    if (resolved.length === 0) {
      outcomes.push({
        selector: label,
        status: 'failed',
        matched: found.length,
        ranges: [],
        detail: `matched ${found.length} element(s), but none can take a child there — a self-closing element has no inside. Use "before" or "after", or address a different element: ${refused.slice(0, 3).join(', ')}`,
      });
      return;
    }

    ranges.push(...resolved);
    outcomes.push({
      selector: label,
      status: 'applied',
      matched: resolved.length,
      ranges: resolved,
      // A selector that reached more than one element inserted more than one
      // copy. That is often meant, and silently doing it is not.
      detail: resolved.length > 1 ? `inserted beside all ${resolved.length} matching elements` : undefined,
    });
  });

  return { ranges, outcomes, available: true };
}

/**
 * Resolve removals to the elements' whole source extents.
 *
 * The span reaches back over the indentation on its line and forward over the
 * newline that ended it, so removing an element leaves no blank line where it
 * used to be — the same trim a line deletion makes, for the same reason.
 */
export function planElementRemovals(
  source: string,
  edits: ElementRemoval[],
): { ranges: TextEditRange[]; outcomes: TextEditOutcome[]; available: boolean; reason?: string } {
  const validity = validateSvg(source);
  if (!validity.doc) {
    return {
      ranges: [], outcomes: [], available: false,
      reason: `the document is not valid XML right now (${validity.message}), so elements cannot be addressed. Use replace_lines until it parses.`,
    };
  }
  const doc = validity.doc;
  const extents = elementExtents(source, doc);
  const ranges: TextEditRange[] = [];
  const outcomes: TextEditOutcome[] = [];

  for (const edit of edits) {
    const label = `remove ${JSON.stringify(edit.selector)}`;
    const found = resolveSelector(doc, edit.selector);
    if (isSelectorError(found)) {
      outcomes.push({ selector: label, status: 'failed', matched: 0, ranges: [], detail: found.error });
      continue;
    }
    if (found.length === 0) {
      outcomes.push({ selector: label, status: 'failed', matched: 0, ranges: [], detail: describeNoMatch(doc, edit.selector) });
      continue;
    }
    if (found.includes(doc.documentElement)) {
      outcomes.push({
        selector: label,
        status: 'failed',
        matched: found.length,
        ranges: [],
        detail: 'this matches the root <svg>, and removing it would leave no document. Use replace_svg to start over.',
      });
      continue;
    }

    const resolved: TextEditRange[] = [];
    const refused: string[] = [];
    for (const el of found) {
      const extent = extents.get(el);
      if (!extent) { refused.push(pathOf(el)); continue; }
      const lineStart = source.lastIndexOf('\n', extent.start - 1) + 1;
      const alone = /^[ \t]*$/.test(source.slice(lineStart, extent.start));
      const trailing = /^[ \t]*\r?\n/.exec(source.slice(extent.end));
      resolved.push({
        start: alone ? lineStart : extent.start,
        end: alone && trailing ? extent.end + trailing[0].length : extent.end,
        replacement: '',
      });
    }

    if (resolved.length === 0) {
      outcomes.push({
        selector: label, status: 'failed', matched: found.length, ranges: [],
        detail: `matched ${found.length} element(s), but their source extent could not be located: ${refused.slice(0, 3).join(', ')}`,
      });
      continue;
    }

    ranges.push(...resolved);
    outcomes.push({
      selector: label,
      status: 'applied',
      matched: resolved.length,
      ranges: resolved,
      detail: resolved.length > 1 ? `removed all ${resolved.length} matching elements` : undefined,
    });
  }

  return { ranges, outcomes, available: true };
}

/** 1-based line number of a source offset. */
export function lineOfOffset(source: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < source.length; i++) if (source[i] === '\n') line += 1;
  return line;
}

export interface MatchInfo {
  path: string;
  tag: string;
  id?: string;
  className?: string;
  line?: number;
  /** The node's OWN character data — see directText. */
  text?: string;
}

/** How much of one node's text a listing shows before truncating. A `<style>`
 * block's content is character data too, and dumping it helps nobody. */
const TEXT_PREVIEW = 400;

/**
 * A node's own character data, excluding every descendant's.
 *
 * `textContent` would be wrong to report and catastrophic to write back. For
 * `<text>PK<tspan>AddressID</tspan></text>` it is "PKAddressID", and setting
 * that would replace the children with a string — deleting the tspan. Each node
 * owns only the characters directly inside it, so every piece of visible text
 * belongs to exactly one address and no edit can clobber another's content.
 */
export function directText(el: Element): string {
  let out = '';
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === 3 /* text */ || node.nodeType === 4 /* CDATA */) out += node.nodeValue ?? '';
  }
  return out;
}

/** The app's positional path for an element — the same format click-to-select
 * produces, so an address can be handed straight back to an edit tool. */
export function pathOf(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;
  while (current && current.nodeType === 1) {
    const tag = current.tagName.toLowerCase();
    let index = 1;
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (sibling.tagName.toLowerCase() === tag) index += 1;
      sibling = sibling.previousElementSibling;
    }
    parts.unshift(`${tag}[${index}]`);
    current = current.parentElement;
  }
  return '/' + parts.join('/');
}

/**
 * Describe what an address matched: identity and location, with no rendering
 * requirement. `get_element_bounds` answers "where is it on screen" and
 * therefore drops gradients, `<defs>` contents and anything hidden — an
 * undercount, in the direction that surprises whoever is about to edit.
 */
export function describeMatches(source: string, doc: Document, elements: Element[]): MatchInfo[] {
  const ranges = elementSourceRanges(source, doc);
  return elements.map((el) => {
    const tag = ranges.get(el);
    const info: MatchInfo = { path: pathOf(el), tag: el.tagName.toLowerCase() };
    if (el.getAttribute('id')) info.id = el.getAttribute('id')!;
    if (el.getAttribute('class')) info.className = el.getAttribute('class')!;
    if (tag) info.line = lineOfOffset(source, tag.start);
    const own = directText(el);
    // Whitespace-only content is layout, not something to read or translate.
    if (own.trim() !== '') {
      info.text = own.length > TEXT_PREVIEW ? own.slice(0, TEXT_PREVIEW) + `… (${own.length} chars)` : own;
    }
    return info;
  });
}
