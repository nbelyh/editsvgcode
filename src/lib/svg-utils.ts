/**
 * Pure utility functions extracted from App.tsx for testability.
 */

import xmlFormat from 'xml-formatter';
import { pathOf as computeXPath } from './svg-dom';

/** Extract document ID from the URL pathname (first segment after '/') */
export function getUniqueId(): string {
  return document.location.pathname.split('/')[1] || '';
}

/** Generate a new random unique ID */
export function getNewUniqueId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * A clean, app-minted document id (getNewUniqueId = base36, lowercase [a-z0-9]).
 * Legacy "_local_…" ids and stale filenames fail this and are re-minted on save.
 * Lives here rather than in useDocument so non-React modules can ask too.
 */
export function isCleanId(id: string): boolean {
  return /^[a-z0-9]+$/.test(id);
}

/** Strip BOM from uploaded file text */
export function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

/**
 * Pretty-print XML/SVG with proper indentation.
 *
 * `xml:space="preserve"` on the root is why this needs any care. It is on almost
 * every exported SVG, and to a general-purpose XML formatter it means "leave all
 * whitespace in this subtree alone" — which, on the root, is the whole document.
 * The file therefore came back exactly as it went in, and formatting was
 * silently a no-op. That is what left label lines looking like
 *
 *     <text x="4" y="1469.68" class="st2">dbo</text>		</g>
 *
 * where the group's closing tag rides along on the label's line, so every edit
 * to that label had to reproduce `</text>		</g>` exactly or break the nesting.
 *
 * In SVG the attribute governs how character data inside text elements is
 * rendered, not the layout whitespace between elements — nothing renders that.
 * So it is masked on the root tag for the duration of the pass and restored
 * afterwards, leaving the document semantically identical.
 *
 * Masking is not safe on its own, though, so the result is CHECKED rather than
 * trusted. `collapseContent` only keeps a `<text>` on one line when its content
 * begins with character data; one whose children are all elements gets
 * re-indented, and under `preserve` that indentation renders — turning
 * `<tspan>a</tspan>\n<tspan>b</tspan>` from one space between the words into
 * five. Any such change fails the check below and the document is returned
 * untouched.
 */
const XML_SPACE_MASK = 'data-preserve-during-format';

/**
 * The `xml:space="preserve"` on the ROOT `<svg>`, in any spelling.
 *
 * Matching only the root matters: the same attribute on a nested element is a
 * genuine instruction about that element. But the root is rarely the first
 * thing in the file — Illustrator, Inkscape and Visio all emit an XML
 * declaration, often a DOCTYPE, and a generator comment ahead of it. Anchoring
 * at `^\s*<svg` skipped every one of those documents, and the failure is
 * invisible: nothing is masked, the formatter preserves the whole file, and the
 * unchanged result is indistinguishable from "already formatted".
 *
 * So the prologue is skipped explicitly, then the first `<svg` must follow.
 */
const ROOT_XML_SPACE =
  /^((?:\s|<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[^>]*>)*<svg\b[^>]*?)\sxml:space\s*=\s*(['"])preserve\2/;

/**
 * The characters a reader actually sees: character data inside text-rendering
 * elements. Whitespace elsewhere is layout and may be changed freely.
 */
function renderedText(svg: string): string {
  const out: string[] = [];
  const re = /<(text|tspan|textPath|tref|title|desc)\b[^>]*>([^<]*)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(svg)) !== null) out.push(m[2]);
  // Joined with a separator that cannot occur in character data, so two
  // adjacent runs cannot merge and hide a difference between them.
  return out.join('\u0001');
}

/**
 * The ordered open/close tag names — the document's structure.
 *
 * The formatter completes unclosed markup rather than refusing it, turning
 * `<svg><g><text>half typed` into a whole valid document. That is reasonable in
 * a formatter and wrong in a text editor: a truncated file would be invisibly
 * "repaired" on open. Inventing tags changes this sequence; so does dropping
 * them.
 */
function tagSequence(svg: string): string {
  return (svg.match(/<\/?[A-Za-z][\w.:-]*/g) ?? []).join(',').toLowerCase();
}

export function formatXml(xml: string): string {
  if (!xml.trim()) return xml;
  try {
    const masked = xml.replace(ROOT_XML_SPACE, `$1 ${XML_SPACE_MASK}="preserve"`);
    const formatted = xmlFormat(masked, {
      indentation: '  ',
      collapseContent: true,
      lineSeparator: '\n',
    });
    const restored = formatted.replace(`${XML_SPACE_MASK}="preserve"`, 'xml:space="preserve"');

    // Verify the invariant instead of trusting the transform. This also catches
    // a mask that failed to restore, since the leftover attribute would have to
    // survive a document that no longer round-trips.
    if (renderedText(restored) !== renderedText(xml) || restored.includes(XML_SPACE_MASK)) {
      console.warn('[formatXml] formatting would have changed rendered text; left the document unchanged');
      return xml;
    }
    if (tagSequence(restored) !== tagSequence(xml)) {
      console.warn('[formatXml] formatting would have added or removed elements; left the document unchanged');
      return xml;
    }
    return restored;
  } catch (err) {
    // Return unformatted if xml-formatter can't parse it — a text editor sees
    // half-typed documents constantly, and refusing to mangle them matters more
    // than formatting them.
    //
    // Say so, though. Swallowing this silently is how formatting could fail on
    // every real document without anyone noticing: the input came back
    // unchanged, which is indistinguishable from "already formatted".
    console.warn('[formatXml] could not format; leaving the document unchanged', err);
    return xml;
  }
}

/**
 * Find the start/end offsets and line/column positions of the Nth occurrence of `<tagName` in source.
 * Returns null if the occurrence is not found.
 */
export function findElementRange(svgCode: string, tagName: string, index: number) {
  if (!tagName || index < 0) return null;

  const openRegex = new RegExp(`<${tagName}[\\s>/]`, 'gi');
  let match: RegExpExecArray | null;
  let count = 0;
  let startOffset = -1;
  while ((match = openRegex.exec(svgCode)) !== null) {
    if (count === index) { startOffset = match.index; break; }
    count++;
  }
  if (startOffset < 0) return null;

  // Find the end: self-closing "/>" or closing "</tagName>"
  let endOffset = startOffset;
  const selfClose = svgCode.indexOf('/>', startOffset);
  const closeTag = svgCode.indexOf(`</${tagName}>`, startOffset);
  const openEnd = svgCode.indexOf('>', startOffset);
  if (selfClose >= 0 && selfClose <= openEnd) {
    endOffset = selfClose + 2;
  } else if (closeTag >= 0) {
    endOffset = closeTag + tagName.length + 3; // </tagName>
  } else if (openEnd >= 0) {
    endOffset = openEnd + 1;
  }

  const before = svgCode.substring(0, startOffset);
  const startLine = before.split('\n').length;
  const startCol = startOffset - before.lastIndexOf('\n');
  const upToEnd = svgCode.substring(0, endOffset);
  const endLine = upToEnd.split('\n').length;
  const endCol = endOffset - upToEnd.lastIndexOf('\n');

  return { startLine, startCol, endLine, endCol, startOffset, endOffset };
}

/**
 * Given a cursor offset in SVG source, find the enclosing element's xpath.
 * Uses DOMParser for accurate nesting, then maps back to source positions.
 * Returns xpath, element text, and line range, or null if cursor is outside any element.
 */
export function findElementAtOffset(svgCode: string, offset: number) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgCode, 'text/xml');
  if (doc.querySelector('parsererror')) return null;

  // Build a list of elements with their source offsets using opening tag regex
  // and match to DOM order via a tree-walk
  const domElements: Element[] = [];
  const walk = (el: Element) => {
    domElements.push(el);
    for (let i = 0; i < el.children.length; i++) walk(el.children[i]);
  };
  if (doc.documentElement) walk(doc.documentElement);

  // Find source ranges for each DOM element in document order
  const openRegex = /<([a-zA-Z][\w.:-]*)/g;
  const sourceElements: { el: Element; tagName: string; start: number; end: number }[] = [];
  let domIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = openRegex.exec(svgCode)) !== null) {
    // Skip closing tags (matched by accident) - the regex only matches opening
    if (svgCode[m.index - 1] === '/') continue;

    const tagStart = m.index;
    const tagName = m[1];
    const domEl = domElements[domIdx];
    if (!domEl || domEl.tagName.toLowerCase() !== tagName.toLowerCase()) continue;
    domIdx++;

    // Find end of this element
    let tagEnd = tagStart;
    const selfClose = svgCode.indexOf('/>', tagStart);
    const openEnd = svgCode.indexOf('>', tagStart);
    if (selfClose >= 0 && selfClose <= openEnd) {
      tagEnd = selfClose + 2;
    } else {
      const closeTag = svgCode.indexOf(`</${tagName}>`, tagStart);
      if (closeTag >= 0) {
        tagEnd = closeTag + tagName.length + 3;
      } else if (openEnd >= 0) {
        tagEnd = openEnd + 1;
      }
    }
    sourceElements.push({ el: domEl, tagName, start: tagStart, end: tagEnd });
  }

  // Find the tightest enclosing element
  let best: (typeof sourceElements)[number] | null = null;
  for (const se of sourceElements) {
    if (offset >= se.start && offset <= se.end) {
      if (!best || (se.start >= best.start && se.end <= best.end)) {
        best = se;
      }
    }
  }
  if (!best) return null;

  // Compute xpath
  const xpath = computeXPath(best.el);

  const before = svgCode.substring(0, best.start);
  const startLine = before.split('\n').length;
  const upToEnd = svgCode.substring(0, best.end);
  const endLine = upToEnd.split('\n').length;

  return {
    element: svgCode.substring(best.start, best.end),
    xpath,
    startLine,
    endLine,
  };
}

/**
 * Compute a positional xpath for an element, e.g. "/svg[1]/g[1]/path[3]".
 *
 * One implementation, in the addressing module: click-to-select emits this and
 * the edit tools resolve it, so if the two ever disagreed the editor and the
 * model would be naming different elements by the same string.
 */
export { computeXPath };
