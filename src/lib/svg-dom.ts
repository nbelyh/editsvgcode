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

/**
 * Every element start tag in source order.
 *
 * For a well-formed document this is the same order as a pre-order walk of the
 * parsed tree, which is what lets a DOM node be mapped back to the bytes that
 * produced it without the parser telling us where anything was.
 */
export function startTagRanges(source: string): StartTag[] {
  const out: StartTag[] = [];
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
    if (source[i] === '<' && source[i + 1] !== '/' && NAME_START.test(source[i + 1] ?? '')) {
      const end = endOfTag(source, i);
      out.push({
        start: i,
        end,
        name: readName(source, i + 1).toLowerCase(),
        selfClosing: source[end - 2] === '/',
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

/** Walk a positional path. Returns the single node it denotes, or nothing. */
function resolvePath(doc: Document, path: string): Element[] {
  const steps = path.split('/').filter((s) => s !== '');
  if (steps.length === 0) return [];

  const root = parseStep(steps[0]);
  let current: Element | null = doc.documentElement;
  if (!root || !current || current.tagName.toLowerCase() !== root.name || root.index !== 1) return [];

  for (const raw of steps.slice(1)) {
    const step = parseStep(raw);
    if (!step || !current) return [];
    const siblings: Element[] = Array.from(current.children).filter((c) => c.tagName.toLowerCase() === step.name);
    current = siblings[step.index - 1] ?? null;
  }
  return current ? [current] : [];
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
  const trimmed = selector.trim();
  if (trimmed === '') return { error: 'empty selector' };
  if (trimmed.startsWith('/')) return resolvePath(doc, trimmed);
  try {
    return Array.from(doc.querySelectorAll(trimmed));
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
      outcomes.push({ selector: edit.selector, status: 'failed', matched: 0, detail: found.error });
      continue;
    }
    if (found.length === 0) {
      outcomes.push({ selector: edit.selector, status: 'failed', matched: 0, detail: 'matched no element. Use query to see what is there.' });
      continue;
    }

    let changed = 0;
    for (const el of found) {
      const tag = tags.get(el);
      if (!tag) continue;
      const text = source.slice(tag.start, tag.end);
      const attr = new RegExp(`\\s${edit.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*=\\s*(["'])[\\s\\S]*?\\1`);
      const m = attr.exec(text);

      if (m) {
        const replacement = edit.value === null ? '' : ` ${edit.name}="${escapeAttr(edit.value)}"`;
        ranges.push({ start: tag.start + m.index, end: tag.start + m.index + m[0].length, replacement });
        changed += 1;
      } else if (edit.value !== null) {
        // Absent: insert just before the tag closes, leaving everything else put.
        const at = tag.end - (tag.selfClosing ? 2 : 1);
        ranges.push({ start: at, end: at, replacement: ` ${edit.name}="${escapeAttr(edit.value)}"` });
        changed += 1;
      }
    }

    const overridden = changed > 0 ? cssRulesOverriding(doc, found, edit.name) : [];
    outcomes.push(changed > 0
      ? {
          selector: edit.selector,
          status: 'applied',
          matched: changed,
          // A presentation attribute is the LOWEST priority in the SVG cascade, so
          // a class rule setting the same property wins and the edit has no visible
          // effect. Silently succeeding while nothing changes on screen is the
          // failure this whole approach exists to avoid, so say it.
          detail: overridden.length > 0
            ? `NOTE: the attribute was set, but "${edit.name}" is also set by CSS (${overridden.slice(0, 3).join(', ')}), which overrides a presentation attribute — the drawing will not change. Edit the rule in the <style> block instead, with replace_lines.`
            : undefined,
        }
      : { selector: edit.selector, status: 'failed', matched: found.length, detail: `matched ${found.length} element(s), none of which has a "${edit.name}" attribute to remove` });
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
}

export interface TextEditOutcome {
  selector: string;
  status: 'applied' | 'failed';
  /** How many nodes this change reached. */
  matched: number;
  detail?: string;
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
      outcomes.push({ selector: edit.selector, status: 'failed', matched: 0, detail: found.error });
      continue;
    }
    if (found.length === 0) {
      outcomes.push({
        selector: edit.selector,
        status: 'failed',
        matched: 0,
        detail: 'matched no element. Use query to see what is there.',
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
        detail: `matched ${found.length} element(s), but none holds a single run of text — they have child elements. Address the children instead: ${refused.slice(0, 3).join(', ')}`,
      });
      continue;
    }

    ranges.push(...resolved);
    outcomes.push({
      selector: edit.selector,
      status: 'applied',
      matched: resolved.length,
      detail: refused.length > 0
        ? `${refused.length} match(es) skipped for having child elements; address those directly: ${refused.slice(0, 3).join(', ')}`
        : undefined,
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
